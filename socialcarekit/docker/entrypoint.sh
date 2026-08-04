#!/bin/sh
set -e

cd /var/www/html

# First run: create a Docker-specific config.php (never overwrites an existing one).
if [ ! -f config/config.php ]; then
    cp docker/config.docker.php config/config.php
    echo "[sck] Created config/config.php for Docker (DB host 'db')."
fi

# Writable dirs for the www-data user (cache, logs, backups, uploads, sitemap).
mkdir -p storage/cache/pages storage/logs storage/backups storage/documents storage/templates/files
chown -R www-data:www-data storage public 2>/dev/null || true

exec "$@"
