package main

import (
	"context"
	"log"

	"binarytrade/internal/config"
	"binarytrade/internal/database"
	"binarytrade/internal/server"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()
	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer pool.Close()

	if err := database.Migrate(ctx, pool); err != nil {
		log.Fatalf("run migrations: %v", err)
	}

	e := server.New(cfg, pool)

	log.Printf("listening on :%s", cfg.Port)
	if err := e.Start(":" + cfg.Port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
