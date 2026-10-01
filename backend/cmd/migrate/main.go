// Command migrate applies the embedded SQL migrations and exits.
//
// It is the standalone counterpart to the migration run inside cmd/api, so
// migrations can be applied as a separate deploy step (Sec 7.1). It requires a
// reachable PostgreSQL at DATABASE_URL at runtime.
package main

import (
	"context"
	"log"

	"void2empire/internal/config"
	"void2empire/internal/database"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	ctx := context.Background()
	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer pool.Close()

	if err := database.Migrate(ctx, pool); err != nil {
		log.Fatalf("run migrations: %v", err)
	}

	log.Printf("migrations applied (env=%s)", cfg.Env)
}
