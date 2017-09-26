# Stitch Umbrella

This is the main umbrella applications for Stitch.

It contains two apps:

- Stitch (supporting business rules)
- StitchConnect (web api and frontend)

---

Getting started (work in progress)

Create .env file in `apps/stitch/` and ask the team for the environment
values you need to set here:

```
export MANDRILL_API_KEY=keygoeshere
```

Run the source command to brint them into your terminal path.

```
cd ~/Work/stitch-phoenix/apps/stitch
source .env
```

Change directory to the root folder of the umbrella project, and install your
Elixir dependencies.

```
cd ~/Work/stitch-phoenix
mix do deps.get, deps.compile, dialyzer --plt
```

Change directory to the stitch project folder, and Create your local database.

```
cd ~/Work/stitch-phoenix/apps/stitch/
mix ecto.create
mix ecto.migrate
MIX_ENV=test mix ecto.create
MIX_ENV=test mix ecto.migrate
```

Change directory to the stitch_connect project folder, and install frontend
dependencies using yarn.

```
cd ~/Work/stith-phoenix/apps/stitch_connect/
yarn
```

Change directory to the root folder of the umbrella project and run the test suite.
If everything is setup properly, you will see all tests pass.

```
cd ~/Work/stitch-phoenix/
mix test

...
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

We're using foreman to run the application in a Heroku-like environment locally.
This guide uses the foreman gem, you can use whatever you like.

```
gem install foreman
cd ~/Work/stitch-phoenix
foreman start -f Procfile.dev
```

Access the site.

https://localhost:4443

---

We're using Dialyzer to write typed Elixir. To run Dialyzer
in the project run the command:

```
mix dialyzer
```

