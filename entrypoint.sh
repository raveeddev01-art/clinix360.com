#!/bin/sh
# Note: !/bin/sh must be at the top of the line,
# Alpine doesn't have bash so we need to use sh.

# Docker entrypoint script.
# Don't forget to give this file execution rights via `chmod +x entrypoint.sh`
# which I've added to the Dockerfile but you could do this manually instead.

source docker.env

# Wait until Postgres is ready before running the next step.
while ! pg_isready -q -h $STITCH_CONNECT_POSTGRES_HOSTNAME -p $STITCH_CONNECT_POSTGRES_PORT -U $STITCH_CONNECT_POSTGRES_USERNAME
do
  echo "$(date) - waiting for database to start."
  sleep 2
done

print_db_name()
{
  `PGPASSWORD=$STITCH_CONNECT_POSTGRES_PASSWORD psql -h $STITCH_CONNECT_POSTGRES_HOSTNAME
  -U $STITCH_CONNECT_POSTGRES_USERNAME -Atqc "\\list $STITCH_CONNECT_POSTGRES_DATABASE"`
}

print_db_name

# Create the database if it doesn't exist.
# -z flag returns true if string is null.

if [[ -z print_db_name ]]; then
  echo "Database $STITCH_CONNECT_POSTGRES_DATABASE does not exist. Creating..."
  mix ecto.create
  echo "Database $STITCH_CONNECT_POSTGRES_DATABASE created."
fi

# Runs migrations, will skip if migrations are up to date.
mix ecto.create
echo "Database $STITCH_CONNECT_POSTGRES_DATABASE exists, running migrations..."
mix ecto.migrate
echo "Migrations finished."

# Start the server.
exec mix phx.server
