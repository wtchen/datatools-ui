# Development

## Using `combine-serve`

Spark does not hot-reload static web files, i.e. the application frontend. To make life easier when doing frontend development, we recommend using [combine-serve](https://github.com/conveyal/combine-serve) to serve both the backend and frontend as a unified service. Used in conjunction with `webpack --watch`, this will eliminate the need to constantly rebuild/reload the frontend for testing.

For example, if running the Java backend on port 9000 (typically via an IDE such as IntelliJ), and you want to serve the combined application on port 9001 for development purposes, use:

```
combine-serve --serve / src/main/resources/public/ --proxy / http://localhost:9000 --port 9001
```
