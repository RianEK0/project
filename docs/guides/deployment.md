# Deployment Guide

This document explains how to deploy Enterprise HRIS, with a primary focus on containerized deployment. All steps below assume they are performed after Monday, July 20, 2026, in an environment that already meets the project's runtime requirements.

## Supported Deployment Models

1. Docker Compose on a single VM or VPS
2. Manual Laravel + React deployment on separate servers

The recommended deployment model for this repository is Docker Compose because the stack files and service dependencies are already included in the repository.

## Production Components

- Laravel API
- Nginx reverse proxy
- PostgreSQL
- Redis
- Queue worker
- Scheduler
- Mail provider production
- HTTPS termination

## Pre-Deployment Checklist

- Domain and DNS already point to the server
- HTTPS certificates are available
- PostgreSQL and Redis capacity planning has been completed
- The production `.env` file is prepared
- A database backup strategy is defined
- Queue workers and the scheduler are confirmed to be running
- `APP_DEBUG=false`
- `APP_ENV=production`
- `LOG_LEVEL=info` or `warning`

## Recommended Production Environment Variables

Example core values:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://hris.example.com
FRONTEND_URL=https://hris.example.com

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=enterprise_hris
DB_USERNAME=enterprise_hris
DB_PASSWORD=strong-password

REDIS_CLIENT=predis
REDIS_HOST=redis
REDIS_PORT=6379

QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=mailer-user
MAIL_PASSWORD=mailer-password
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME="Enterprise HRIS"
```

## Docker Compose Deployment

### 1. Prepare Server

- Install Docker Engine
- Install Docker Compose Plugin
- Make sure ports `80` and `443` are reachable
- Prepare the deployment directory

### 2. Clone Repository

```bash
git clone <repository-url> /srv/enterprise-hris
cd /srv/enterprise-hris
```

### 3. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Adjust `backend/.env` for the production environment.

### 4. Start Stack

```bash
docker compose up -d --build
```

### 5. Run One-Time Application Commands

```bash
docker compose exec laravel php artisan migrate --force
docker compose exec laravel php artisan db:seed --force
docker compose exec laravel php artisan optimize
```

If this is not the first deployment, only run seeders when they are truly needed.

### 6. Verify Health

Check:

- `http://your-domain/up`
- `docker compose ps`
- `docker compose logs laravel`
- `docker compose logs nginx`
- `docker compose logs queue`
- `docker compose logs scheduler`

## Frontend Deployment Options

### Option A: Frontend Built Separately

- Build the frontend into static assets
- Serve it through a separate Nginx host or CDN
- Point `VITE_API_BASE_URL` to the API domain

### Option B: Frontend Dev Profile

The frontend profile in `docker-compose.yml` is better suited for development or staging, not final production.

For production, the frontend should ideally be built and hosted as immutable static assets.

## HTTPS and Reverse Proxy

This repository includes Nginx for the internal application gateway, but for production you are still encouraged to use one of the following approaches:

- Nginx host-level
- Traefik
- Caddy
- Cloud load balancer with TLS termination

Minimum checklist:

- Force HTTPS
- Set `APP_URL` and `FRONTEND_URL` to `https://...`
- Configure trusted proxies correctly

## Queue and Scheduler

Queue workers and the scheduler are required for the following features:

- Notification delivery
- Leave approval notification
- Employee provisioning notification
- Scheduled workforce snapshot

Make sure the `queue` and `scheduler` services remain active at all times.

## Post-Deployment Smoke Test

Run the following checks:

1. The `/up` endpoint returns `200`
2. Login works with a seeded account or a production admin account
3. The `/api/v1/dashboard` endpoint is accessible after login
4. The queue worker receives new jobs
5. The mail provider can send email
6. Storage is writable for document uploads

## Backup Strategy

Minimum recommended backups:

- PostgreSQL daily full backup
- WAL or an incremental strategy if audit requirements are high
- Back up important Laravel storage upload volumes
- Store backups separately from the primary host

## Rollback Strategy

Minimum rollback plan:

1. Tag the deployment image or commit
2. Save a database backup before major migrations
3. If deployment fails:
   - roll back the application image
   - restore the database if the migration is destructive

## Observability

Recommended additions:

- Centralized log aggregation
- PostgreSQL monitoring
- Redis monitoring
- Error tracking
- Health endpoint monitoring
- Disk usage monitoring for uploads and logs

## Security Checklist

- `APP_DEBUG=false`
- Passwords and secrets are not stored in the repository
- Use a unique JWT secret per environment
- Use a production SMTP provider with secure credentials
- Restrict database and Redis access to internal networks
- Enforce HTTPS end-to-end
- Rotate credentials regularly

## Upgrade Notes

Before upgrading the application:

1. Run the test suite
2. Review the migrations that will be executed
3. Backup database
4. Deploy to staging first
5. Then deploy to production
