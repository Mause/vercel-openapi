import { assert } from "console";
import { readFileSync } from "fs";
const manifest = JSON.parse(readFileSync("oclif.manifest.json"));
const success = Object.keys(manifest.commands).length > 0;

process.exit(success ? 0 : 1);
