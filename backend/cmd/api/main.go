// Command api is the HTTP API binary (Sec 7.1).
package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"void2empire/internal/config"
	"void2empire/internal/database"
	"void2empire/internal/server"
)

// shutdownGrace is how long a stopped server keeps serving in-flight requests
// before forcing the rest closed. It must stay inside Docker's stop_grace_period
// (10s by default, counted from when it sends SIGTERM); a longer drain only
// decides whether the log records a clean shutdown before the container is
// killed anyway.
const shutdownGrace = 5 * time.Second

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	// SIGTERM is what `docker compose stop`/`up` sends. Handling it is what lets a
	// redeploy finish the requests already in flight instead of cutting them off
	// mid-write.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer pool.Close()

	if err := database.Migrate(ctx, pool); err != nil {
		log.Fatalf("run migrations: %v", err)
	}

	e, err := server.New(cfg, pool)
	if err != nil {
		log.Fatalf("build server: %v", err)
	}

	// Start() blocks until the listener closes, so the signal is waited on
	// alongside it. drained lets main wait for the shutdown to finish before the
	// deferred pool.Close() runs, so no request is left holding a closed pool.
	drained := make(chan struct{})
	go func() {
		defer close(drained)
		<-ctx.Done()
		log.Printf("shutdown signal received, draining for up to %s", shutdownGrace)

		shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownGrace)
		defer cancel()
		if err := e.Shutdown(shutdownCtx); err != nil {
			log.Printf("shutdown: %v", err)
		}
	}()

	log.Printf("listening on :%s", cfg.Port)
	if err := e.Start(":" + cfg.Port); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("server error: %v", err)
	}
	<-drained

	log.Print("shutdown complete")
}
