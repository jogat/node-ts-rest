import { describe, expect, it } from "vitest";
import { createArtisanProgram } from "@console/artisan";
import { discoverRoutes, getDoctorChecks, getProjectSummary } from "@console/support";

describe("Console support", () => {
  it("discovers the current API routes", () => {
    const routes = discoverRoutes();

    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ method: "USE", path: "/v1" }),
        expect.objectContaining({ method: "GET", path: "/posts" }),
        expect.objectContaining({ method: "POST", path: "/auth/login" }),
      ])
    );
  });

  it("describes the project structure and console alias", () => {
    const summary = getProjectSummary();

    expect(summary.structure).toEqual(expect.arrayContaining([expect.stringContaining("src/console")]));
    expect(summary.aliases).toEqual(expect.arrayContaining([expect.stringContaining("@console/*")]));
    expect(summary.commands).toEqual(expect.arrayContaining([expect.stringContaining("artisan:")]));
  });

  it("registers the artisan command tree", () => {
    const program = createArtisanProgram();
    const commandNames = program.commands.map((command) => command.name());
    const dbCommand = program.commands.find((command) => command.name() === "db");
    const userCommand = program.commands.find((command) => command.name() === "user");
    const databaseCommandNames = dbCommand?.commands.map((command) => command.name()) ?? [];
    const userCommandNames = userCommand?.commands.map((command) => command.name()) ?? [];

    expect(commandNames).toEqual(expect.arrayContaining(["about", "routes", "hello", "doctor", "db", "user"]));
    expect(databaseCommandNames).toEqual(expect.arrayContaining(["status", "migrate", "rollback", "seed"]));
    expect(userCommandNames).toEqual(expect.arrayContaining(["create"]));
  });

  it("checks the console and roadmap files", () => {
    const checks = getDoctorChecks();
    const checkPaths = checks.map((check) => check.path);

    expect(checkPaths).toEqual(
      expect.arrayContaining([
        "src/console/artisan.ts",
        "src/console/commands/HelloCommand.ts",
        "src/console/commands/RoutesCommand.ts",
        "src/console/support.ts",
        "docs/console.md",
        "milestones/README.md",
      ])
    );
  });
});
