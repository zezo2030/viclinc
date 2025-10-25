# Makefile for Clinic Management System

.PHONY: help dev prod build clean logs restart status

# Default target
help:
	@echo "🏥 Clinic Management System - Docker Commands"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-build     - Build and start development environment"
	@echo "  make dev-down      - Stop development environment"
	@echo ""
	@echo "Production Commands:"
	@echo "  make prod          - Start production environment"
	@echo "  make prod-build    - Build and start production environment"
	@echo "  make prod-down     - Stop production environment"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make build         - Build all images"
	@echo "  make clean         - Clean up containers and images"
	@echo "  make logs          - Show logs for all services"
	@echo "  make restart       - Restart all services"
	@echo "  make status        - Show status of all services"
	@echo ""

# Development environment
dev:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d

dev-build:
	@echo "🔨 Building and starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build -d

dev-down:
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

# Production environment
prod:
	@echo "🚀 Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d

prod-build:
	@echo "🔨 Building and starting production environment..."
	docker-compose -f docker-compose.prod.yml up --build -d

prod-down:
	@echo "🛑 Stopping production environment..."
	docker-compose -f docker-compose.prod.yml down

# Build all images
build:
	@echo "🔨 Building all images..."
	docker-compose -f docker-compose.dev.yml build
	docker-compose -f docker-compose.prod.yml build

# Clean up
clean:
	@echo "🧹 Cleaning up containers and images..."
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.prod.yml down -v
	docker system prune -f

# Show logs
logs:
	@echo "📋 Showing logs for all services..."
	docker-compose -f docker-compose.dev.yml logs -f

# Restart services
restart:
	@echo "🔄 Restarting all services..."
	docker-compose -f docker-compose.dev.yml restart

# Show status
status:
	@echo "📊 Service Status:"
	@echo ""
	@echo "Development Environment:"
	docker-compose -f docker-compose.dev.yml ps
	@echo ""
	@echo "Production Environment:"
	docker-compose -f docker-compose.prod.yml ps

# Quick start for development
start: dev-build
	@echo "✅ Development environment is ready!"
	@echo "🌐 Website: http://localhost:3001"
	@echo "🔧 API: http://localhost:3000"
	@echo "📧 MailHog: http://localhost:8025"
