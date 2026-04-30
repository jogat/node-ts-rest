import fs from "fs";
import path from "path";
import ts from "typescript";
import { closeDatabaseConnection, db } from "@database/connection";

type PackageJson = {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type TsConfig = {
  compilerOptions?: {
    paths?: Record<string, string[]>;
    outDir?: string;
  };
};

export type RouteEntry = {
  file: string;
  method: string;
  path: string;
};

export type ProjectCheck = {
  path: string;
  exists: boolean;
};

export type ProjectSummary = {
  name: string;
  version: string;
  framework: string[];
  structure: string[];
  aliases: string[];
  commands: string[];
  dependencies: string[];
  devDependencies: string[];
};

export type DatabaseStatus = {
  completed: string[];
  pending: string[];
};

function resolveProjectRoot(): string {
  const candidates = [process.cwd(), path.resolve(__dirname, ".."), path.resolve(__dirname, "../..")];
  const root = candidates.find((candidate) => fs.existsSync(path.join(candidate, "package.json")) && fs.existsSync(path.join(candidate, "tsconfig.json")));

  if (!root) {
    throw new Error("Unable to resolve project root.");
  }

  return root;
}

const root = resolveProjectRoot();
const srcRoot = path.join(root, "src");

function readJson<T>(relativePath: string): T {
  const contents = fs.readFileSync(path.join(root, relativePath), "utf8");

  if (relativePath.endsWith("tsconfig.json")) {
    const result = ts.parseConfigFileTextToJson(relativePath, contents);

    if (result.error) {
      throw new Error(ts.flattenDiagnosticMessageText(result.error.messageText, "\n"));
    }

    return result.config as T;
  }

  return JSON.parse(contents) as T;
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(root, relativePath));
}

function collectFiles(directory: string, extension: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectFiles(fullPath, extension);
      }

      return entry.isFile() && entry.name.endsWith(extension) ? [fullPath] : [];
    })
    .sort();
}

function relative(filePath: string): string {
  return path.relative(root, filePath);
}

function formatMigrationName(migration: unknown): string {
  if (typeof migration === "string") {
    return migration;
  }

  if (migration && typeof migration === "object") {
    const candidate = migration as { file?: string; name?: string; title?: string };

    return candidate.file ?? candidate.name ?? candidate.title ?? JSON.stringify(migration);
  }

  return String(migration);
}

export function discoverRoutes(): RouteEntry[] {
  const routeFiles = collectFiles(path.join(srcRoot, "routes"), ".ts");
  const routePattern = /\b\w+\.(get|post|put|patch|delete|options|head|all|use)\(\s*["'`]([^"'`]+)["'`]/g;

  return routeFiles.flatMap((file) => {
    const contents = fs.readFileSync(file, "utf8");
    const routes: RouteEntry[] = [];

    for (const match of contents.matchAll(routePattern)) {
      routes.push({
        file: relative(file),
        method: match[1].toUpperCase(),
        path: match[2],
      });
    }

    return routes;
  });
}

export function getProjectSummary(): ProjectSummary {
  const pkg = readJson<PackageJson>("package.json");
  const tsconfig = readJson<TsConfig>("tsconfig.json");
  const dependencies = Object.keys(pkg.dependencies ?? {});
  const devDependencies = Object.keys(pkg.devDependencies ?? {});
  const aliases = Object.entries(tsconfig.compilerOptions?.paths ?? {}).map(([alias, targets]) => {
    return `${alias} -> ${targets.join(", ")}`;
  });

  return {
    name: pkg.name ?? "server",
    version: pkg.version ?? "",
    framework: [
      `express ${pkg.dependencies?.express ?? "not installed"}`,
      `typescript ${pkg.devDependencies?.typescript ?? "not installed"}`,
      `commander ${pkg.dependencies?.commander ?? "not installed"}`,
      `compiled output ${tsconfig.compilerOptions?.outDir ?? "not configured"}`,
    ],
    structure: [
      "src/app",
      "src/config",
      "src/console",
      "src/database",
      "src/database/migrations",
      "src/database/seeders",
      "src/exceptions",
      "src/http/controllers",
      "src/http/middleware",
      "src/http/requests",
      "src/http/resources",
      "src/models",
      "src/policies",
      "src/routes",
      "src/services",
      "src/support",
    ].map((directory) => `${directory}${fileExists(directory) ? "" : " (missing)"}`),
    aliases,
    commands: Object.entries(pkg.scripts ?? {}).map(([name, script]) => `${name}: ${script}`),
    dependencies,
    devDependencies,
  };
}

export function getDoctorChecks(): ProjectCheck[] {
  return [
    "BOOST.md",
    "README.md",
    "package.json",
    "tsconfig.json",
    "docs/console.md",
    "milestones/README.md",
    "src/app/Server.ts",
    "src/console/artisan.ts",
    "src/console/commands/HelloCommand.ts",
    "src/console/commands/RoutesCommand.ts",
    "src/console/commands/UserCommand.ts",
    "src/console/output.ts",
    "src/console/support.ts",
    "src/exceptions/Handler.ts",
    "src/http/middleware/errorHandler.ts",
    "src/http/middleware/notFound.ts",
  ].map((checkPath) => ({
    path: checkPath,
    exists: fileExists(checkPath),
  }));
}

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const [completed, pending] = (await db.migrate.list()) as [unknown[], unknown[]];

  return {
    completed: completed.map(formatMigrationName),
    pending: pending.map(formatMigrationName),
  };
}

export async function runMigrations(): Promise<void> {
  await db.migrate.latest();
}

export async function rollbackMigrations(): Promise<void> {
  await db.migrate.rollback();
}

export async function seedDatabase(): Promise<void> {
  await db.seed.run();
}

export async function closeConsoleDatabase(): Promise<void> {
  await closeDatabaseConnection();
}
