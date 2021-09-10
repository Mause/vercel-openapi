import { Command, flags } from "@oclif/command";
import { readdir, readFile, writeFile } from "fs/promises";
import { resolve, join, parse } from "path";
import { parseDocument } from "yaml";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { register } from "ts-node";
import { OpenApiBuilder, PathItemObject, OpenAPIObject, SchemaObject, OperationObject } from "openapi3-ts";
const { defaultMetadataStorage } = require("class-transformer/cjs/storage");

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

  for (const filename of await readdir(resolve(dir))) {
    const name = parse(filename).name;
    if (name != "openapi.yaml" && filename.endsWith(".ts")) {
      const endpoint = require(join(dir, name)) as Endpoint; // register models
      const path = "/api/" + name;
      if (!endpoint.responseShape) {
        throw new Error(`Missing responseShape for ${path}`);
      }
      doc.addPath(path, generatePath(name, endpoint));
    }
  }

  for (const [name, schema] of Object.entries(
    validationMetadatasToSchemas({
      refPointerPrefix: "#/components/schemas/",
      classTransformerMetadataStorage: defaultMetadataStorage,
    })
  )) {
    doc.addSchema(name, schema);
  }

  const result = doc.getSpec();

  for (const operation of Object.values<PathItemObject>(result.paths)) {
    for (const verb of Object.values(operation)) {
      if (!isOperationObject(verb)) continue;
      let ref = (verb!.responses.default! as SchemaObject).content![
        "application/json"
      ].schema.$ref;
      const parts = ref.split("/");
      ref = parts[parts.length - 1];
      if (!result.components!.schemas![ref]) {
        throw new Error(`Couldn't find ${ref}`);
      }
    }
  }

  return doc.rootDoc;
}

function generatePath(name: string, endpoint: Endpoint): PathItemObject {
  const methods = endpoint.methods || new Set("get");
  const recased = name[0].toUpperCase() + name.substring(1);

  const def: PathItemObject = {};

  for (const method of methods) {
    def[method] = {
      operationId: method + recased,
      responses: {
        default: {
          $ref: "#/components/schemas/" + endpoint.responseShape,
        },
      },
    };
    if (method !== ("get" as string) || method !== ("delete" as string)) {
      def[method].requestBody = {
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

function isOperationObject(t: any): t is OperationObject {
  return t.operationId;
}

class VercelOpenapi extends Command {
  static description = "describe the command here";

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" }),
    outputFile: flags.string({ char: "o" }),
  };

  static args = [{ name: "file", required: true }];

  async run() {
    const { args, flags } = this.parse(VercelOpenapi);

    const result = await generateOpenapi(args.file);
    if (flags.outputFile) {
      await writeFile(flags.outputFile, result.toString());
    } else {
      this.log(JSON.stringify(result, undefined, 2));
    }
  }
}

export = VercelOpenapi;
