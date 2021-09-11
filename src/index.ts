import { Command, flags } from "@oclif/command";
import { readdir, readFile, writeFile } from "fs/promises";
import { resolve, join, parse } from "path";
import { parseDocument } from "yaml";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { register } from "ts-node";
import {
  OpenApiBuilder,
  PathItemObject,
  OpenAPIObject,
  OperationObject,
} from "openapi3-ts";
import { validateDoc } from "./validation";
import pino from "pino";
const { defaultMetadataStorage } = require("class-transformer/cjs/storage");

const log = pino({ prettyPrint: true });

interface Endpoint {
  responseShape?: string;
  requestShape?: string;
  methods?: Set<keyof Pick<PathItemObject, "get">>;
}

async function generateOpenapi(dir: string) {
  // register .ts extensions
  register({ cwd: dir });

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

  let baseDoc = parseDocument(
    (await readFile(filename)).toString()
  ).toJSON() as OpenAPIObject;
  baseDoc.components = {
    schemas: {},
    securitySchemes: {},
  };

  return OpenApiBuilder.create(baseDoc);
}

class VercelOpenapi extends Command {
  static description = "describe the command here";

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: "v" }),
    debug: flags.boolean({ char: "d" }),
    help: flags.help({ char: "h" }),
    outputFile: flags.string({ char: "o" }),
  };

  static args = [{ name: "directory", required: true }];

  async run() {
    const { args, flags } = this.parse(VercelOpenapi);

    log.level = flags.debug ? "debug" : "info";

    const result = await generateOpenapi(args.directory);
    if (flags.outputFile) {
      await writeFile(flags.outputFile, result.toString());
    } else {
      this.log(JSON.stringify(result, undefined, 2));
    }
  }
}

export = VercelOpenapi;
