# Event Source

![Node CI](https://github.com/RobinMalfait/event-source/workflows/Node%20CI/badge.svg)

A node library for writing event sourced applications.

## Usage

```js
import {
  Aggregate,
  Command,
  Event,
  abort,
  createEventMapper,
  createEventSource,
  createProjector,
  createTestEventStore,
} from '@robinmalfait/event-source'
```

## Local Development

Below is a list of commands you will probably find useful.

### `pnpm start`

Start the build in watch mode, which makes it easy to make incremental builds.

### `pnpm build`

Build the package!

### `pnpm test`

Runn all the tests!
