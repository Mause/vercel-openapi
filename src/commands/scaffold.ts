import { Command, Flags } from "@oclif/core";
import { OpenApiBuilder } from "openapi3-ts";
import { writeOut } from "..";

class Scaffold extends Command {
  static description = "Generates a scaffolded openapi.yaml";

  static examples = [
    "$ vercel-openapi scaffold --title FakeAPI --version 1.0.42",
  ];

  static flags = {
    outputFile: Flags.string({ char: "o" }),
    title: Flags.string({ char: "t", required: true }),
    version: Flags.string({ char: "v", required: true }),
  };

  async run() {
    const { flags } = await this.parse(Scaffold);

    const builder = new OpenApiBuilder().addInfo({
      title: flags.title,
      version: flags.version,
    }).rootDoc;

    await writeOut(builder, flags);
  }
}

export = Scaffold;
