import { expect, test } from "@oclif/test";
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";
import chai from "chai";
import { parseDocument } from "yaml";

chai.use(jestSnapshotPlugin());

import cmd = require("../src");

describe("vercel-openapi", () => {
  test
    .stdout()
    .command(["generate", "test/fake"])
    .it("runs", (ctx) => {
      expect(ctx.stdout).toMatchSnapshot();
    });

  test
    .stderr()
    .command(["generate", "test/fake", "--debug"])
    .it("runs --debug", (ctx) => {
      expect(ctx.stderr).toMatchSnapshot();
    });

  test
    .stdout()
    .command(["generate", "test/fake", "--gitVersion"])
    .it("runs --gitVersion", (ctx) => {
      expect(parseDocument(ctx.stdout).getIn(["info", "version"])).to.match(
        /^0.0.1\+[a-z0-9]{7}$/
      );
    });
});

describe("scaffold", () => {
  test
    .stdout()
    .command(["scaffold", "--title", "FakeAPI", "--version", "1.0.42"])
    .it("runs scaffold", (ctx) => {
      expect(ctx.stdout).toMatchSnapshot();
    });
});
