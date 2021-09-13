# vercel-openapi

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/vercel-openapi.svg)](https://npmjs.org/package/vercel-openapi)
[![Downloads/week](https://img.shields.io/npm/dw/vercel-openapi.svg)](https://npmjs.org/package/vercel-openapi)
[![License](https://img.shields.io/npm/l/vercel-openapi.svg)](https://github.com/Mause/vercel-openapi/blob/master/package.json)
[![NPM](https://nodei.co/npm/vercel-openapi.png)](https://nodei.co/npm/vercel-openapi/)

<!-- toc -->
* [vercel-openapi](#vercel-openapi)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g vercel-openapi
$ vercel-openapi COMMAND
running command...
$ vercel-openapi (-v|--version|version)
vercel-openapi/0.0.17 win32-x64 node-v14.17.4
$ vercel-openapi --help [COMMAND]
USAGE
  $ vercel-openapi COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`vercel-openapi generate DIRECTORY`](#vercel-openapi-generate-directory)
* [`vercel-openapi help [COMMAND]`](#vercel-openapi-help-command)
* [`vercel-openapi scaffold`](#vercel-openapi-scaffold)

## `vercel-openapi generate DIRECTORY`

Generates openapi.yaml for vercel serverless functions

```
USAGE
  $ vercel-openapi generate DIRECTORY

OPTIONS
  -d, --debug
  -h, --help                   show CLI help
  -i, --inputFile=inputFile    Defaults to [directory]/api/openapi.yaml
  -o, --outputFile=outputFile

EXAMPLE
  $ vercel-openapi generate . --output public/openapi.yaml
```

## `vercel-openapi help [COMMAND]`

display help for vercel-openapi

```
USAGE
  $ vercel-openapi help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `vercel-openapi scaffold`

Generates a scaffolded openapi.yaml

```
USAGE
  $ vercel-openapi scaffold

OPTIONS
  -o, --outputFile=outputFile
  -t, --title=title            (required)
  -v, --version=version        (required)

EXAMPLE
  $ vercel-openapi scaffold --title FakeAPI --version 1.0.42
```
<!-- commandsstop -->
