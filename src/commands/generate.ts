import { Command, flags } from "@oclif/command";
import { readFile } from "fs/promises";
import fs from "fs";
import { resolve, join } from "path";
import { parseDocument } from "yaml";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { register } from "ts-node";
import {
  OpenApiBuilder,
  PathItemObject,
  OpenAPIObject,
  OperationObject,
  ContentObject,
} from "openapi3-ts";
import { validateDoc } from "../validation";
import pino from "pino";
import { writeOut } from "..";
import _ from "lodash";
import glob from "glob";
const { defaultMetadataStorage } = require("class-transformer/cjs/storage");
import Parser from "@oclif/parser";

const log = pino({ prettyPrint: true });

interface Endpoint {
  responseShape?: string;
  requestShape?: string;
  tags?: string[];
  methods?: Set<keyof Pick<PathItemObject, "get">>;
}

enum ModuleSystem {
  CommonJS = "CommonJS",
  AMD = "AMD",
  System = "System",
  UMD = "UMD",
  ES6 = "ES6",
  ES2015 = "ES2015",
  ES2020 = "ES2020",
  ESNext = "ESNext",
  None = "None",
}

async function generateOpenapi(
  templateFile: string,
  dir: string,
  flags: Parser.OutputFlags<typeof Generate["flags"]>,
  moduleSystem?: ModuleSystem
) {
  // register .ts extensions
  register({ cwd: dir, compilerOptions: { module: moduleSystem } });

  dir = resolve(join(dir, "api"));
  const doc = await loadTemplate(templateFile);

  if (flags.gitVersion) {
    doc.rootDoc.info.version += "+" + (await getCommitHash(dir));
  }

  const paths: string[] = await new Promise((resolve, reject) => {
    glob("**/*.ts", { cwd: dir }, (err, val) => {
      if (err) reject(err);
      else resolve(val || []);
    });
  });

  for (const filename of paths.sort()) {
    log.debug({ filename }, "Loading file");
    let name = filename.substring(0, filename.lastIndexOf("."));
    if (filename.endsWith(".ts")) {
      doc.addPath(...generatePath(name, dir));
    }
  }

  for (const [name, schema] of Object.entries(
    validationMetadatasToSchemas({
      refPointerPrefix: "#/components/schemas/",
      classTransformerMetadataStorage: defaultMetadataStorage,
    })
  )) {
    log.debug({ schemaName: name }, "Adding schema");
    doc.addSchema(name, schema);
  }

  validateDoc(doc);
  log.debug({}, "Validation successful");

  return doc.rootDoc;
}

function generatePath(name: string, dir: string): [string, PathItemObject] {
  const endpoint = require(join(dir, name)) as Endpoint; // register models
  if (!endpoint.responseShape) {
    throw new Error(`Missing responseShape for ${name}`);
  }

  const opea = generatePathItemObject(
    processParts(name, toTitlecase, ""),
    endpoint
  );
  opea.parameters = name
    .split("/")
    .filter(partIsDynamic)
    .map((name) => ({
      name: name.substring(1, name.length - 1),
      in: "path",
      required: true,
      schema: {
        type: "string",
      },
    }));

  const path = "/api/" + processParts(name, (part) => "{" + part + "}", "/");

  return [path, opea];
}

function processParts<T>(name: string, func: (s: string) => T, join: string) {
  return name
    .split("/")
    .map((part) =>
      partIsDynamic(part) ? func(part.substr(1, part.length - 2)) : part
    )
    .join(join);
}

function partIsDynamic(name: string) {
  return name[0] == "[" && name[name.length - 1] == "]";
}

function generatePathItemObject(
  name: string,
  endpoint: Endpoint
): PathItemObject {
  const methods = Array.from(endpoint.methods || ["get"]).map((str) =>
    str.toLowerCase()
  );
  const recased = toTitlecase(name);

  const def: PathItemObject = {};

  for (const method of methods) {
    const op: OperationObject = (def[method] = {
      operationId: method + recased,
      tags: endpoint.tags,
      responses: {
        default: {
          description: "Ok",
          content: buildContent(endpoint.responseShape!),
        },
      },
    });
    if (method !== "get" && method !== "delete") {
      if (!endpoint.requestShape?.length) {
        throw new Error(`Missing requestShape for ${name} for ${method}`);
      }
      op.requestBody = {
        content: buildContent(endpoint.requestShape),
        required: true,
      };
    }
  }

  return def;
}

function toTitlecase(name: string) {
  return name[0].toUpperCase() + name.substring(1);
}

function buildContent(ref: string): ContentObject {
  return {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/" + ref,
      },
    },
  };
}

async function loadTemplate(templateFile: string) {
  const filename = resolve(templateFile);
  log.debug({ filename }, "Loading template");

  const builder = new OpenApiBuilder();

  _.merge(
    builder.rootDoc,
    parseDocument(
      (await readFile(filename)).toString()
    ).toJSON() as OpenAPIObject
  );

  return builder;
}

async function getCommitHash(dir: string) {
  const git = require("isomorphic-git");
  const gitdir = await git.findRoot({
    fs,
    filepath: dir,
  });
  return (await git.resolveRef({ fs, ref: "HEAD", dir: gitdir })).substring(
    0,
    7
  );
}

const pair = flags.build({
  parse(input, _context): [string, string] {
    const idx = input.indexOf("=");
    const key = input.substring(0, idx);
    const value = input.substring(idx + 1);
    return [key, value];
  },
});

class Generate extends Command {
  static description = "Generates openapi.yaml for vercel serverless functions";

  static examples = [
    "$ vercel-openapi generate . --output public/openapi.yaml",
  ];

  static flags = {
    // add --version flag to show CLI version
    debug: flags.boolean({ char: "d" }),
    help: flags.help({ char: "h" }),
    outputFile: flags.string({ char: "o" }),
    inputFile: flags.string({
      char: "i",
      description: "Defaults to [directory]/api/openapi.yaml",
    }),
    envVar: pair({
      multiple: true,
      char: "e",
      helpValue: "KEY=VALUE",
      description:
        "Environment variables to have in scope for loading the endpoints.",
    }),
    gitVersion: flags.boolean(),
    moduleSystem: flags.enum<ModuleSystem>({
      char: "m",
      description: `Sets the module system for loading the endpoints
      
      If you need more flexibility, you can set the TS_NODE_COMPILER_OPTIONS environment variable before invoking
      vercel-openapi. Note that the --envVar flag won't work for this option, as ts-node parses the environment
      variable before the cli starts.
      `,
      options: Object.values(ModuleSystem),
    }),
  };

  static args = [{ name: "directory", required: true }];

  async run() {
    const { args, flags } = this.parse(Generate);

    log.level = flags.debug ? "debug" : "info";

    // These will only apply for this process and its children.
    for (const [key, value] of flags.envVar || []) {
      log.debug({ key, value }, "Setting env var");
      process.env[key] = value;
    }

    const result = await generateOpenapi(
      flags.inputFile || args.directory + "/api/openapi.yaml",
      args.directory,
      flags,
      flags.moduleSystem
    );
    await writeOut(result, flags);
  }
}

export = Generate;
