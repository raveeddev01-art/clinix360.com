FROM elixir:1.5.2

RUN mix archive.install \
  --force \
  https://github.com/phoenixframework/archives/raw/master/phx_new.ez

WORKDIR /app

# Even our staging app runs with MIX_ENV = prod on Enclave. I recommend
# this because otherwise you'll be showing error stacktraces, etc.
ENV MIX_ENV prod

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
RUN apt-get update && apt-get install -y --no-install-recommends locales
RUN echo en_US.UTF-8 UTF-8 > /etc/locale.gen && locale-gen && \
  update-locale LANG=en_US.UTF-8

# Install Node, NPM, YARN
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn

RUN mix local.hex --force
RUN mix local.rebar --force

# Install project app dependencies.
RUN apt-get install -y imagemagick xvfb libfontconfig wkhtmltopdf

# This precompiles your deps before adding your code, which lets you take advantage of Docker
# caching while you iterate on your app.
ADD mix.exs mix.exs
ADD mix.lock mix.lock
ADD apps/stitch_connect/mix.exs apps/stitch_connect/mix.exs
ADD apps/stitch/mix.exs apps/stitch/mix.exs
RUN mix deps.get
RUN mix compile

ADD apps/stitch_connect/package.json apps/stitch_connect/package.json
ADD apps/stitch_connect/yarn.lock apps/stitch_connect/yarn.lock
RUN cd apps/stitch_connect && yarn

# This actually adds the app
ADD . .
WORKDIR /app/apps/stitch_connect

RUN npm run deploy

# Obviates the need for a Procfile
CMD ["mix", "phx.server"]

# The default Elixir config looks up the port in the $PORT environment variable, so that works for us.
ENV PORT 443
EXPOSE 443