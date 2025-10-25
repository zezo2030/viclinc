@echo off
REM Batch file for Docker commands on Windows

if "%1"=="help" goto help
if "%1"=="dev" goto dev
if "%1"=="dev-build" goto dev-build
if "%1"=="dev-down" goto dev-down
if "%1"=="prod" goto prod
if "%1"=="prod-build" goto prod-build
if "%1"=="prod-down" goto prod-down
if "%1"=="build" goto build
if "%1"=="clean" goto clean
if "%1"=="logs" goto logs
if "%1"=="restart" goto restart
if "%1"=="status" goto status
if "%1"=="start" goto start
goto help

:help
echo 🏥 Clinic Management System - Docker Commands
echo.
echo Development Commands:
echo   docker-commands.bat dev          - Start development environment
echo   docker-commands.bat dev-build     - Build and start development environment
echo   docker-commands.bat dev-down      - Stop development environment
echo.
echo Production Commands:
echo   docker-commands.bat prod          - Start production environment
echo   docker-commands.bat prod-build    - Build and start production environment
echo   docker-commands.bat prod-down     - Stop production environment
echo.
echo Utility Commands:
echo   docker-commands.bat build         - Build all images
echo   docker-commands.bat clean         - Clean up containers and images
echo   docker-commands.bat logs          - Show logs for all services
echo   docker-commands.bat restart       - Restart all services
echo   docker-commands.bat status        - Show status of all services
echo.
goto end

:dev
echo 🚀 Starting development environment...
docker-compose -f docker-compose.dev.yml up -d
goto end

:dev-build
echo 🔨 Building and starting development environment...
docker-compose -f docker-compose.dev.yml up --build -d
goto end

:dev-down
echo 🛑 Stopping development environment...
docker-compose -f docker-compose.dev.yml down
goto end

:prod
echo 🚀 Starting production environment...
docker-compose -f docker-compose.prod.yml up -d
goto end

:prod-build
echo 🔨 Building and starting production environment...
docker-compose -f docker-compose.prod.yml up --build -d
goto end

:prod-down
echo 🛑 Stopping production environment...
docker-compose -f docker-compose.prod.yml down
goto end

:build
echo 🔨 Building all images...
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.prod.yml build
goto end

:clean
echo 🧹 Cleaning up containers and images...
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.prod.yml down -v
docker system prune -f
goto end

:logs
echo 📋 Showing logs for all services...
docker-compose -f docker-compose.dev.yml logs -f
goto end

:restart
echo 🔄 Restarting all services...
docker-compose -f docker-compose.dev.yml restart
goto end

:status
echo 📊 Service Status:
echo.
echo Development Environment:
docker-compose -f docker-compose.dev.yml ps
echo.
echo Production Environment:
docker-compose -f docker-compose.prod.yml ps
goto end

:start
call :dev-build
echo ✅ Development environment is ready!
echo 🌐 Website: http://localhost:3001
echo 🔧 API: http://localhost:3000
echo 📧 MailHog: http://localhost:8025
goto end

:end
