import { Command, flags } from "@oclif/command";
import { readdir, readFile, writeFile } from "fs/promises";
import { resolve, join, parse } from "path";
import { parseDocument, stringify } from "yaml";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { register } from "ts-node";
import {
  OpenApiBuilder,
  PathItemObject,
  OpenAPIObject,
  OperationObject,
} from "openapi3-ts";
import { validateDoc } from "../validation";
import pino from "pino";
import { writeOut } from "..";
import _ from "lodash";
const { defaultMetadataStorage } = require("class-transformer/cjs/storage");

const log = pino({ prettyPrint: true });

interface Endpoint {
  responseShape?: string;
  requestShape?: string;
  methods?: Set<keyof Pick<PathItemObject, "get">>;
}

async function generateOpenapi(dir: string) {
  // register .ts extensions
  register({ cwd: dir, moduleTypes: { "*.ts": "cjs" } });

  dir = resolve(join(dir, "api"));
  const doc = await loadTemplate(dir);

  for (const filename of (await readdir(resolve(dir))).sort()) {
    log.debug({ filename }, "Loading file");
    let name = parse(filename).name;
    if (filename.endsWith(".ts")) {
      doc.addPath(...generatePath(doc, name, dir));
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

function generatePath(
  doc: OpenApiBuilder,
  name: string,
  dir: string
): [string, PathItemObject] {
  const endpoint = require(join(dir, name)) as Endpoint; // register models
  if (!endpoint.responseShape) {
    throw new Error(`Missing responseShape for ${name}`);
  }
  const isDynamic = name[0] == "[" && name[name.length - 1] == "]";
  if (isDynamic) {
    name = name.substr(1, name.length - 2);
  }

  const opea = generatePathItemObject(name, endpoint);
  if (isDynamic) {
    opea.parameters?.push({
      name: "dynamic_segment",
      in: "path",
      schema: {
        type: "string",
      },
    });
  }

  let path = "/api/" + name;
  if (isDynamic) {
    path += "/{dynamic_segment}";
  }

  return [path, opea];
}

function generatePathItemObject(
  name: string,
  endpoint: Endpoint
): PathItemObject {
  const methods = Array.from(endpoint.methods || ["get"]).map((str) =>
    str.toLowerCase()
  );
  const recased = name[0].toUpperCase() + name.substring(1);

  const def: PathItemObject = {};

  for (const method of methods) {
    const op: OperationObject = (def[method] = {
      operationId: method + recased,
      responses: {
        default: {
          $ref: "#/components/schemas/" + endpoint.responseShape,
        },
      },
    });
    if (method !== "get" && method !== "delete") {
      if (!endpoint.requestShape?.length) {
        throw new Error(`Missing requestShape for ${name} for ${method}`);
      }
      op.requestBody = {
        $ref: "#/components/schemas/" + endpoint.requestShape,
      };
    }
  }

  return def;
}

async function loadTemplate(dir: string) {
  const filename = resolve(dir + "/openapi.yaml");

  const builder = new OpenApiBuilder();

  _.merge(
    builder.rootDoc,
    parseDocument(
      (await readFile(filename)).toString()
    ).toJSON() as OpenAPIObject
  );

  return builder;
}

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
  };

  static args = [{ name: "directory", required: true }];

  async run() {
    const { args, flags } = this.parse(Generate);

    log.level = flags.debug ? "debug" : "info";

    const result = await generateOpenapi(args.directory);
    await writeOut(result, flags);
  }
}

export = Generate;
