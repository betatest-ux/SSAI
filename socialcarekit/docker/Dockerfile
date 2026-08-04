FROM php:8.2-apache

RUN docker-php-ext-install pdo_mysql \
    && a2enmod rewrite headers expires

# Serve the app's public/ directory as the document root.
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
      /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && printf '<Directory /var/www/html/public>\n  AllowOverride All\n  Require all granted\n</Directory>\n' \
      > /etc/apache2/conf-enabled/sck-override.conf

# Match the production upload limits shipped in public/.user.ini.
COPY docker/uploads.ini /usr/local/etc/php/conf.d/uploads.ini

COPY docker/entrypoint.sh /usr/local/bin/sck-entrypoint
RUN chmod +x /usr/local/bin/sck-entrypoint

ENTRYPOINT ["sck-entrypoint"]
CMD ["apache2-foreground"]
