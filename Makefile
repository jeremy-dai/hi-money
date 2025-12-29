.PHONY: help install dev build preview lint clean test

# Default target
help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development server"
	@echo "  make build      - Build for production"
	@echo "  make preview    - Preview production build"
	@echo "  make lint       - Run ESLint"
	@echo "  make clean      - Remove build artifacts and dependencies"
	@echo "  make test       - Run tests (if configured)"

# Install dependencies
install:
	npm install

# Start development server
dev:
	npm run dev

# Build for production
build:
	npm run build

# Preview production build
preview:
	npm run preview

# Run linter
lint:
	npm run lint

# Clean build artifacts and dependencies
clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf .vite

# Run tests (placeholder - add test script to package.json)
test:
	@echo "No tests configured yet. Add 'test' script to package.json"
