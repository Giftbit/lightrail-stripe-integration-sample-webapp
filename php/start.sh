#!/usr/bin/env bash

set -a
. ../shared/.env
set +a

if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed.' >&2
  exit 1
fi
echo "Lightrail demo starting on http://localhost:$HTTP_PORT"
docker run -d -p $HTTP_PORT:80 --name stripe-integration-sample-php-webapp -v "`pwd`":/var/www/html -v "`pwd`/../shared":/var/www/shared php:5.5-apache /bin/bash -c 'a2enmod rewrite; apache2-foreground'
