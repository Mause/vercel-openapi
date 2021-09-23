import {expect, test} from "@oclif/test";
import {jestSnapshotPlugin} from "mocha-chai-jest-snapshot";
import chai from "chai";
import {parseDocument} from "yaml";

chai.use(jestSnapshotPlugin());

import cmd = require("../src");

describe("vercel-openapi", () => {
  test
    .stdout()
    .do(() => cmd.run(["generate", "test/fake"]))
    .it("runs", context => {
      expect(context.stdout).toMatchSnapshot();
    });

  test
    .stderr()
    .do(() => cmd.run(["generate", "test/fake", "--debug"]))
    .it("runs --debug", context => {
      expect(context.stderr).toMatchSnapshot();
    });

  test
    .stdout()
    .do(() => cmd.run(["generate", "test/fake", "--gitVersion"]))
    .it("runs --gitVersion", context => {
      expect(parseDocument(context.stdout).getIn(["info", "version"])).to.match(
        /^0.0.1\+[\da-z]{7}$/,
      );
    });
});

describe("scaffold", () => {
  test
    .stdout()
    .do(() =>
      cmd.run(["scaffold", "--title", "FakeAPI", "--version", "1.0.42"]),
    )
    .it("runs scaffold", context => {
      expect(context.stdout).toMatchSnapshot();
    });
});
