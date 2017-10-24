FROM elixir:1.5.2

RUN mix archive.install \
  --force \
  https://github.com/phoenixframework/archives/raw/master/phx_new.ez

WORKDIR /app

# Even our staging app runs with MIX_ENV = prod on Enclave. I recommend
# this because otherwise you'll be showing error stacktraces, etc.
ENV MIX_ENV prod

RUN apt-get update && apt-get install -y --no-install-recommends locales
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

RUN apt-get update && apt-get install -y --no-install-recommends locales
RUN echo en_US.UTF-8 UTF-8 > /etc/locale.gen
RUN locale-gen
RUN update-locale LANG=en_US.UTF-8

RUN mix local.hex --force
RUN mix local.rebar --force

# NOTE: one of our (indirect) deps (unicode_util_compat) requires Make, which is why we install it here
# You may be able to remove this.
RUN apt-get update \
  && apt-get install make \
  && rm -rf /var/lib/apt/lists/*

# This actually adds the app
ADD . .

# This precompiles your deps before adding your code, which lets you take advantage of Docker
# caching while you iterate on your app.
ADD mix.exs mix.exs
ADD mix.lock mix.lock
RUN mix deps.get
RUN mix compile

FROM node:8.2
WORKDIR /app/apps/stitch_connect
RUN npm install -g yarn
RUN yarn
RUN npm run deploy

WORKDIR /app

# Obviates the need for a Procfile
CMD ["mix", "phx.server"]

# The default Elixir config looks up the port in the $PORT environment variable, so that works for us.
ENV PORT 443
EXPOSE 443
