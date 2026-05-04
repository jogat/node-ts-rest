import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

function readProjectFile(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("Milestone docs", () => {
  it("tracks the Laravel-inspired pipelines milestone from the index", () => {
    const readme = readProjectFile("milestones/README.md");

    expect(readme).toContain("[Laravel-inspired pipelines](./14-laravel-inspired-pipelines.md)");
    expect(fs.existsSync(path.join(process.cwd(), "milestones/14-laravel-inspired-pipelines.md"))).toBe(true);
  });

  it("captures payload and option travel requirements for pipelines", () => {
    const milestone = readProjectFile("milestones/14-laravel-inspired-pipelines.md");

    expect(milestone).toContain("PipelinePayload<TInput, TOutput>");
    expect(milestone).toContain("input");
    expect(milestone).toContain("output");
    expect(milestone).toContain("Post instance");
    expect(milestone).toContain("getMetaValue(key)");
    expect(milestone).toContain("setMetaValue(key, value)");
    expect(milestone).toContain("getOption(key)");
    expect(milestone).toContain("setOption(key, value)");
    expect(milestone).toContain("shouldHalt");
    expect(milestone).toContain("shouldSkipPipeline");
    expect(milestone).toContain("Stages may read or mutate those options");
  });
});
