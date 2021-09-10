import { expect, test } from "@oclif/test";
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";
import chai from "chai";

chai.use(jestSnapshotPlugin());

import cmd = require("../src");

describe("vercel-openapi", () => {
  test
    .stdout()
    .do(() => cmd.run(["--help"]))
    .exit(0)
    .it("runs help", (ctx) => {
      expect(ctx.stdout).toMatchSnapshot();
    });

  test
    .stdout()
    .do(() => cmd.run(["test/fake"]))
    .it("runs", (ctx) => {
      expect(ctx.stdout).toMatchSnapshot();
    });
});

describe("vercel-openapi (debug)", () => {
  test
    .stderr()
    .do(() => cmd.run(["test/fake", "--debug"]))
    .it("runs hello", (ctx) => {
      expect(ctx.stderr).toMatchSnapshot();
    });
});
