# ./Dockerfile

# Extend from the official Elixir image
FROM elixir:1.14-alpine
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.14/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.14/community' >> /etc/apk/repositories
# FROM elixir:1.10.4

# Install required libraries on Alpine
# note: build-base required to run mix “make” for
# one of my dependecies (appsignal)
RUN apk update && apk upgrade && \
  apk add git && \
  apk add postgresql-client && \
  apk add nodejs npm && \
  apk add ghostscript && \
  apk add fontconfig && \
  apk add imagemagick && \
  apk add xvfb && \
  apk add wkhtmltopdf && \
  apk add build-base && \
  rm -rf /var/cache/apk/*

RUN npm install -g yarn

# Set environment to production
ENV MIX_ENV prod

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Install hex package manager and rebar
# By using --force, we don’t need to type “Y” to confirm the installation
RUN mix do local.hex --force, local.rebar --force

# Cache elixir dependecies and lock file
ADD mix.exs mix.exs
ADD mix.lock mix.lock
ADD apps/stitch_web/mix.exs apps/stitch_web/mix.exs
ADD apps/stitch/mix.exs apps/stitch/mix.exs

# Install and compile production dependecies
RUN HEX_HTTP_CONCURRENCY=1 HEX_HTTP_TIMEOUT=120 mix do deps.get --only prod
RUN mix deps.compile

# Cache and install node packages and dependencies
ADD apps/stitch_web/package.json apps/stitch_web/
RUN cd apps/stitch_web && \
    yarn install

# Copy all application files
ADD . .

# Run frontend build, compile, and digest assets
RUN cd apps/stitch_web/ && \
    yarn deploy && \
    cd - && \
    source docker.env 
    && \
    mix do deps.loadpaths, phx.digest

WORKDIR /

# Run entrypoint.sh script
RUN chmod +x entrypoint.sh
# CMD ["/entrypoint.sh"]
