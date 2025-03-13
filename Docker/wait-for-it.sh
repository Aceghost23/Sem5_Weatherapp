#!/bin/sh
# Warte auf Host und Port

TIMEOUT=60
HOST=$1
PORT=$2
shift 2
CMD="$@"

echo "Warte auf $HOST:$PORT..."
while ! nc -z -w 5 $HOST $PORT; do
  echo "❌ $HOST:$PORT nicht erreichbar. Versuche erneut..."
  sleep 1
  TIMEOUT=$(($TIMEOUT - 1))
  if [ "$TIMEOUT" -le 0 ]; then
    echo "❌ Verbindung zu $HOST:$PORT fehlgeschlagen."
    exit 1
  fi
done

echo "✅ $HOST:$PORT ist verfügbar! Starte Applikation..."
exec $CMD




