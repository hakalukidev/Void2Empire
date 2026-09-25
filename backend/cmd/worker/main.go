// Command worker is the background-worker binary (Sec 7.1).
//
// It is intentionally a skeleton: no job definitions exist yet because every
// financial background job (settlement, liquidation, reconciliation, notification
// dispatch, outbox relay) depends on the database/ledger layer, which is not built.
// This establishes the process shape — config load, signal handling, graceful
// shutdown — so jobs can be registered here in the DB phase without inventing any
// business rule now (Rule #3, Rule #35).
//
// It does not connect to the database, so it compiles and runs without one.
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"void2empire/internal/config"
)

func main() {
	cfg := config.Load()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	log.Printf("worker started (env=%s); no jobs registered yet", cfg.Env)

	// Jobs are registered and run here in the DB phase. Until then the worker
	// simply waits for a termination signal.
	<-ctx.Done()

	log.Print("worker shutting down")
}
