# Logging Middleware

This package exposes a single function `Log(stack, level, package, message)`.
It sends a log entry to the evaluation log API every time it is called.

## Setup

1) Get an access token from the auth API.
2) Set these environment variables:

- `LOG_AUTH_TOKEN` (required)
- `LOG_URL` (optional, defaults to the evaluation logs endpoint)

## Example

```js
const { Log } = require("./index");

async function run() {
  await Log("backend", "info", "service", "vehicle scheduler started");
}

run();
```
