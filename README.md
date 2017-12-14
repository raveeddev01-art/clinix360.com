# Stitch Umbrella

This is the main umbrella application for
[Stitch](https://connect.teamstitch.com/).

It contains two apps:

- Stitch (supporting business rules)
- StitchConnect (web api and frontend)

---

## Getting started (work in progress)

Install external dependencies

- `imagemagick` (https://www.imagemagick.org/script/index.php) (`brew install imagemagick` or `sudo apt install imagemagick`)

Update `/etc/hosts` (`YOURTEAMSUBDOMAIN` should the name of a team)

```
127.0.0.1 localhost
127.0.0.1 YOURTEAMSUBDOMAIN.localhost
```

You should be working from the `develop` branch:

```sh
git checkout develop
```

Create an `.env` file in the root project directiry with the following
contents, and ask the team for the environment values you need to set here:

```sh
export APP_HOST=localhost

export MANDRILL_API_KEY=keygoeshere

export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
export S3_BUCKET_NAME=
export S3_REGION=us-east-1

export APNS_TOPIC=
export APNS_CERT_B64=
export APNS_KEY_B64=
export APNS_MODE=dev
export FCM_KEY=

export STRIPE_SECRET_KEY=
export STRIPE_PUBLISHABLE_KEY=

export TWILIO_ACCOUNT_SID=
export TWILIO_AUTH_TOKEN=
```

Source the file to add these environment variables to your current shell
session.

```sh
cd ~/Work/stitch-phoenix/
source .env
```

Change directory to the root folder of the umbrella project, and install your
Elixir dependencies.

```sh
cd ~/Work/stitch-phoenix
mix do deps.get, deps.compile, dialyzer --plt
```

Change directory to the `stitch` project folder, and create your local database.

```sh
cd ~/Work/stitch-phoenix/apps/stitch/
mix ecto.create
mix ecto.migrate
MIX_ENV=test mix ecto.create
MIX_ENV=test mix ecto.migrate
```

Change directory to the `stitch_connect` project folder, and install the frontend
dependencies using yarn.

```sh
cd ~/Work/stitch-phoenix/apps/stitch_connect/
yarn
```

Change directory to the root folder of the umbrella project and run the test suite.
If everything is setup properly, you will see all tests pass.

```sh
cd ~/Work/stitch-phoenix/
mix test
```

```
→ mix test
==> stitch
.............................

Finished in 0.2 seconds
29 tests, 0 failures

Randomized with seed 381823
==> stitch_connect
....

Finished in 0.06 seconds
4 tests, 0 failures

Randomized with seed 660577
```

We're using `foreman` to run the application in a Heroku-like environment locally.
This guide uses the `foreman` gem, you can use whatever you like.

```sh
gem install foreman
cd ~/Work/stitch-phoenix
foreman start -f Procfile.dev
```

Access the site.

https://localhost:4443/

---

We're using Dialyzer to write typed Elixir. To run Dialyzer
in the project run the command:

```
mix dialyzer
```

