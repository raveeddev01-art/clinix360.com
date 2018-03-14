# Stitch Umbrella

This is the main umbrella application for
[Stitch](https://connect.teamstitch.com/).

It contains two Elixir applications:

* Stitch (supporting business rules)
* StitchConnect (web api and frontend)

---

## Getting started (work in progress)

Set up elixir and erlang. Confirm you have properly set this up by running `iex` in a terminal window.

Set up node. Install yarn globally with `npm install -g yarn` if you have not yet done so.

Set up and launch postgres if you have not yet done so.

Install external dependencies

* `imagemagick` (https://www.imagemagick.org/script/index.php) (`brew install imagemagick` or `sudo apt install imagemagick`)

* `wkhtmltopdf` (https://github.com/pdfkit/pdfkit/wiki/Installing-WKHTMLTOPDF) Needed to generate PDFs.

* `chromedriver` (https://sites.google.com/a/chromium.org/chromedriver/) Needed to run automated tests. (`brew install chromedriver`)

Add to `/etc/hosts` (`YOURTEAMSUBDOMAIN` should the name of a team).

```
127.0.0.1 localhost.app YOURTEAMSUBDOMAIN.localhost.app
```

You should be working from the `develop` branch:

```sh
git checkout develop
```

Create an `.env` file in the root project directiry with the following
variables.

Ask the team for the environment values you need to set here:

```sh
export APP_HOST=localhost.app

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

export INTERCOM_IDENTITY_VERIFICATION_SECRET=
export INTERCOM_APP_ID=
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

https://localhost.app:4443/

Note: depending on your browser, you may have to add an SSL certificate exception to access the site.

---

We're using Dialyzer to write typed Elixir. To run Dialyzer
in the project run the command:

```
mix dialyzer
```

### Stitch.Analytics Maintenance & Development Recommendations

When working on maintaining or extending `Stitch.Analytics` consider these
recommendations to more easily test or debug as needed.

1. Edit `config/dev.exs` for `Stitch.Analytics` to push events to `Segment`:

In dev env `Stitch` is configured to use `Stitch.Analytics.Segment.InMemory`.
This means that analytics events will be created in the `segment_events` DB
table and move from there to the `InMemory` process. This allows us to test our
analytics system in dev env without hitting the Segment API. In prod env
`Stitch` is configured to use `Stitch.Analytics.Segment.HTTPClient` instead. To
test/debug in dev env, while hitting the Segment API and the associated destinations
configured on Segment, edit `config/dev.exs to use the`HTTPClient`module. If you do this, remember to use the Segment API keys for the`Staging`source and not`Production`.

2. Edit `config/dev.exs` to enable `Stitch.Analytics.Sync.RecurringSync`:

In dev env `Stitch.Analytics.Sync.RecurringSync` is disabled. This means
analytics events are created in the `segment_events` DB table but never move
from there to `Segment` (our remote analytics store). For analytics events to
move from the Stitch DB to Segment automatically make sure you follow point 1
(above) and then enable the `RecurringSync` process. If you want to manually
move events from the DB to Segment, without enabling the `RecurringSync`
process, you can also call `Stitch.Analytics.Sync.perform()` directly as
needed.
