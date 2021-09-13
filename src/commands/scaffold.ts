import Command, { flags } from "@oclif/command";
import { OpenApiBuilder } from "openapi3-ts";
import { writeOut } from "..";

class Scaffold extends Command {
  static description = "Generates a scaffolded openapi.yaml";

  static examples = [
    "$ vercel-openapi scaffold --title FakeAPI --version 1.0.42",
  ];

  static flags = {
    outputFile: flags.string({ char: "o" }),
    title: flags.string({ char: "t", required: true }),
    version: flags.string({ char: "v", required: true }),
  };

  async run() {
    const { flags } = this.parse(Scaffold);

    const builder = new OpenApiBuilder().addInfo({
      title: flags.title,
      version: flags.version,
    }).rootDoc;

    await writeOut(builder, flags);
  }
}

export = Scaffold;