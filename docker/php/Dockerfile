FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    bash \
    fcgi \
    curl \
    git \
    icu-dev \
    libpq-dev \
    oniguruma-dev \
    postgresql-client \
    unzip \
    zip \
 && docker-php-ext-install \
    bcmath \
    intl \
    opcache \
    pcntl \
    pdo_pgsql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_HOME=/tmp/composer-cache

WORKDIR /var/www/html

COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-enterprise-hris.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/zz-enterprise-hris.conf
COPY docker/php/entrypoint.sh /usr/local/bin/enterprise-entrypoint
COPY docker/php/healthcheck.sh /usr/local/bin/healthcheck-laravel

RUN chmod +x /usr/local/bin/enterprise-entrypoint /usr/local/bin/healthcheck-laravel

ENTRYPOINT ["/usr/local/bin/enterprise-entrypoint"]
CMD ["php-fpm", "-F"]
