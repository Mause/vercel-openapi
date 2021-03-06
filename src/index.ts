import { writeFile } from "fs/promises";
import "./commands/generate";
import "./commands/scaffold";
import { OpenAPIObject } from "openapi3-ts";
import { stringify } from "yaml";

export { Endpoint } from "./commands/generate";
export { run } from "@oclif/core";

export async function writeOut(
  result: OpenAPIObject,
  flags: { outputFile: string | undefined }
) {
  const output = stringify(result, undefined, {
    indent: 2,
    aliasDuplicateObjects: false,
  });
  if (flags.outputFile) {
    await writeFile(flags.outputFile, output);
  } else {
    console.log(output);
  }
}
