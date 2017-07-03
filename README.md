# Stitch Umbrella

This is the main umbrella applications for Stitch.

It contains two apps:

- Stitch (supporting business rules)
- StitchConnect (web api and frontend)

---

Getting started (work in progress)

create .env file in `apps/stitch/` and ask for values:

```
export MANDRILL_API_KEY=keygoeshere
```

In your terminal bring it in:

```
cd ~/Work/stitch-phoenix/apps/stitch
source .env
```

Install Elixir dependencies. Change directory to the root folder of the project.

```
cd ~/Work/stitch-phoenix
mix deps.get
```

Create local database.

```
cd ~/Work/stitch-phoenix/apps/stitch/
mix ecto.create
mix ecto.migrate
```

Install frontend dependencies. Change directory to the stitch_connect folder.

```
cd ~/Work/stith-phoenix/apps/stitch_connect/
yarn
```

Run the stitch_connect app.

```
cd ~/Work/stitch-phoenix/apps/stitch_connect
mix phx.server
```

Access the site:

https://localhost:4443


