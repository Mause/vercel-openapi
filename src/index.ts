import { Command, flags } from "@oclif/command";
import { readFile, readdir, writeFile } from "fs/promises";
import { resolve, join } from "path";
import { parseDocument, YAMLMap } from "yaml";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";

async function generateOpenapi(dir: string) {
  dir = resolve(join(dir, "api"));
  const filename = resolve(dir + "/openapi.yaml");
  console.log(filename);
  const doc = parseDocument((await readFile(filename)).toString());

  const paths = doc.get("paths") as YAMLMap<string, {}>;
  for (const filename of await readdir(resolve(dir))) {
    const name = filename.substr(0, filename.lastIndexOf("."));
    if (name != "openapi.yaml" && filename.endsWith(".ts")) {
      const path = join(dir, name);
      const endpoint = require(path); // register models
      if (!endpoint.responseShape) {
        throw new Error(`Missing responseShape for ${path}`);
      }
      let value = paths.get(path) as YAMLMap<string, {}>;
      if (!value) {
        value = new YAMLMap();
        const get = new YAMLMap();
        value.set("get", get);
        get.set(
          "operationId",
          "get" + name[0].toUpperCase() + name.substring(1)
        );
        get.set(
          "responses",
          doc.createNode({
            default: {
              description: "Ok",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/" + endpoint.responseShape,
                  },
                },
              },
            },
          })
        );
      }
      paths.set(path, value);
    }
  }

  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: "#/components/schemas/",
  });
  doc.setIn(["components", "schemas"], doc.createNode(schemas));

  for (const operation of (
    doc.get("paths") as YAMLMap<
      string,
      YAMLMap<string, YAMLMap<string, string>>
    >
  ).items) {
    if (operation.value) {
      for (const verb of operation.value.items) {
        let ref = verb!.value!.getIn([
          "responses",
          "default",
          "content",
          "application/json",
          "schema",
          "$ref",
        ]) as string;
        const parts = ref.split("/");
        ref = parts[parts.length - 1];
        if (!schemas[ref]) {
          throw new Error(`Couldn't find ${ref}`);
        }
      }
    }
  }

  return doc;
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
