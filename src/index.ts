import { writeFile } from "fs/promises";
import { OpenAPIObject } from "openapi3-ts";
import { stringify } from "yaml";

export { run } from "@oclif/command";

export async function writeOut(
  result: OpenAPIObject,
  flags: { outputFile: string | undefined }
) {
  const output = stringify(result, undefined, 2);
  if (flags.outputFile) {
    await writeFile(flags.outputFile, output);
  } else {
    console.log(output);
  }
}
