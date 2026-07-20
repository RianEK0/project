#!/bin/sh

set -eu

cd /var/www/html

if [ ! -f .env ] && [ -f .env.example ]; then
    cp .env.example .env
fi

mkdir -p \
    bootstrap/cache \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/testing \
    storage/framework/views \
    storage/logs

chmod -R ug+rwx bootstrap/cache storage || true

if [ ! -f vendor/autoload.php ]; then
    composer install --prefer-dist --no-interaction --no-progress
fi

if [ -f artisan ] && [ -f .env ]; then
    if ! grep -Eq '^APP_KEY=base64:' .env; then
        php artisan key:generate --force --ansi
    fi

    if ! grep -Eq '^JWT_SECRET=.+$' .env; then
        php artisan jwt:secret --force --ansi
    fi

    if [ ! -L public/storage ] && [ ! -e public/storage ]; then
        php artisan storage:link --ansi || true
    fi
fi

exec "$@"
