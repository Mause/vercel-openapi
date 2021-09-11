import { expect, test } from "@oclif/test";
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";
import chai from "chai";

chai.use(jestSnapshotPlugin());

import cmd = require("../src");

describe("vercel-openapi", () => {
  test
    .stdout()
    .do(() => cmd.run(["generate", "test/fake"]))
    .it("runs", (ctx) => {
      expect(ctx.stdout).toMatchSnapshot();
    });

  test
    .stderr()
    .do(() => cmd.run(["generate", "test/fake", "--debug"]))
    .it("runs --debug", (ctx) => {
      expect(ctx.stderr).toMatchSnapshot();
    });
});
