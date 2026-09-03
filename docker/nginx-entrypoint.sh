#!/bin/sh
set -e
CONF="/etc/nginx/conf.d/default.conf"
CERT="/etc/nginx/ssl/cert.pem"
KEY="/etc/nginx/ssl/key.pem"

if [ ! -f "$CERT" ] || [ ! -f "$KEY" ]; then
  echo "TLS certs not found at $CERT / $KEY - starting plain HTTP only."
  # Remove the second (443) server block by truncating at its marker comment.
  # The 443 block starts at the line containing '# HTTPS server'.
  if grep -q "# HTTPS server" "$CONF"; then
    awk '/# HTTPS server/{exit} {print}' "$CONF" > "$CONF.tmp" && mv "$CONF.tmp" "$CONF"
  fi
else
  echo "TLS certs found - enabling HTTPS."
fi

nginx -t
exec nginx -g "daemon off;"
