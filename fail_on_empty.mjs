import { assert } from "console";
import { readFileSync } from "fs";
const commands = JSON.parse(readFileSync("oclif.manifest.json")).commands;
console.log({ collectedCommands: Object.keys(commands) });
const success = Object.keys(commands).length > 0;

process.exit(success ? 0 : 1);
