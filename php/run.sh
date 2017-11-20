#!/usr/bin/env bash

set -a
. ../.env
set +a

if ! [ -x "$(command -v php)" ]; then
  echo 'Error: php is not installed.' >&2
  exit 1
fi

php -S localhost:$HTTP_PORT -t src/
