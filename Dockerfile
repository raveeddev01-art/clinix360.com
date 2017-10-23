FROM elixir:1.5.2

RUN mix archive.install \
  --force \
  --sha512 f02d2320a5135cff961324baad4ab784483af9c934759a7041c6d11e260fc0c61a90b204342b8ab6b5a1a13941d74e352c99003d9753dd404f8f90cf2693b86f \
  https://github.com/phoenixframework/archives/raw/master/phx_new.ez

WORKDIR /app

# Even our staging app runs with MIX_ENV = prod on Enclave. I recommend
# this because otherwise you'll be showing error stacktraces, etc.
ENV MIX_ENV prod
RUN apt-get update && apt-get install -y locales && locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

RUN mix local.hex --force
RUN mix local.rebar --force

# NOTE: one of our (indirect) deps (unicode_util_compat) requires Make, which is why we install it here
# You may be able to remove this.
RUN apt-get update \
  && apt-get install make \
  && rm -rf /var/lib/apt/lists/*

# This precompiles your deps before adding your code, which lets you take advantage of Docker
# caching while you iterate on your app.
ADD mix.exs mix.exs
ADD mix.lock mix.lock
RUN mix deps.get
RUN mix compile

# Obviates the need for a Procfile
CMD ["mix", "phx.server"]

# The default Elixir config looks up the port in the $PORT environment variable, so that works for us.
ENV PORT 443
EXPOSE 443

# This actually adds the app
ADD . .
