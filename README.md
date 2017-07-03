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
source app/stitch/.env
```

Run the stitch_connect app.

```
cd /apps/stitch_connect
mix ecto.create
mix ecto.migrate
mix phx.server
```


