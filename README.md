# vercel-openapi

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/vercel-openapi.svg)](https://npmjs.org/package/vercel-openapi)
[![Downloads/week](https://img.shields.io/npm/dw/vercel-openapi.svg)](https://npmjs.org/package/vercel-openapi)
[![License](https://img.shields.io/npm/l/vercel-openapi.svg)](https://github.com/Mause/vercel-openapi/blob/master/package.json)
[![NPM](https://nodei.co/npm/vercel-openapi.png)](https://nodei.co/npm/vercel-openapi/)

<!-- toc -->

- [vercel-openapi](#vercel-openapi)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g vercel-openapi
$ vercel-openapi COMMAND
running command...
$ vercel-openapi (--version)
vercel-openapi/0.1.12 linux-x64 node-v16.8.0
$ vercel-openapi --help [COMMAND]
USAGE
  $ vercel-openapi COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`vercel-openapi generate DIRECTORY`](#vercel-openapi-generate-directory)
- [`vercel-openapi help [COMMAND]`](#vercel-openapi-help-command)
- [`vercel-openapi scaffold`](#vercel-openapi-scaffold)

## `vercel-openapi generate DIRECTORY`

Generates openapi.yaml for vercel serverless functions

```
USAGE
  $ vercel-openapi generate [DIRECTORY] [-d] [-h] [-o <value>] [-i <value>] [-e <value>] [--gitVersion] [-m
    CommonJS|AMD|System|UMD|ES6|ES2015|ES2020|ESNext|None]

FLAGS
  -d, --debug

  -e, --envVar=KEY=VALUE...
      Environment variables to have in scope for loading the endpoints.

  -h, --help
      Show CLI help.

  -i, --inputFile=<value>
      Defaults to [directory]/api/openapi.yaml

  -m, --moduleSystem=(CommonJS|AMD|System|UMD|ES6|ES2015|ES2020|ESNext|None)
      Sets the module system for loading the endpoints

      If you need more flexibility, you can set the TS_NODE_COMPILER_OPTIONS environment variable before invoking
      vercel-openapi. Note that the --envVar flag won't work for this option, as ts-node parses the environment
      variable before the cli starts.

  -o, --outputFile=<value>

  --gitVersion
      Append the short git hash to the end of the api version

DESCRIPTION
  Generates openapi.yaml for vercel serverless functions

EXAMPLES
  $ vercel-openapi generate . --output public/openapi.yaml
```

_See code: [dist/commands/generate.js](https://github.com/Mause/vercel-openapi)_

## `vercel-openapi help [COMMAND]`

Display help for vercel-openapi.

```
USAGE
  $ vercel-openapi help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for vercel-openapi.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `vercel-openapi scaffold`

Generates a scaffolded openapi.yaml

```
USAGE
  $ vercel-openapi scaffold -t <value> -v <value> [-o <value>]

FLAGS
  -o, --outputFile=<value>
  -t, --title=<value>       (required)
  -v, --version=<value>     (required)

DESCRIPTION
  Generates a scaffolded openapi.yaml

EXAMPLES
  $ vercel-openapi scaffold --title FakeAPI --version 1.0.42
```

_See code: [dist/commands/scaffold.js](https://github.com/Mause/vercel-openapi)_

<!-- commandsstop -->
