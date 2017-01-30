# Development

## mastarm

We use Conveyal's front-end JS tool-belt [`mastarm`](https://github.com/conveyal/mastarm) to build, run, and lint while developing.

To kick off a development server at [http://localhost:9966](http://localhost:9966):

```
npm start
```

This will use `mastarm` to run a browserify server at the above port along with a proxy for the back-end API, which is assumed to be running on http://localhost:4000.