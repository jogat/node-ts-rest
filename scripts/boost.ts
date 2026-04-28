import fs from "fs";
import path from "path";
import ts from "typescript";

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

type RouteEntry = {
  file: string;
  method: string;
  path: string;
};

const root = path.resolve(__dirname, "..");
const srcRoot = path.join(root, "src");

const command = process.argv[2] ?? "about";

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

function printSection(title: string): void {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

function printList(items: string[], emptyMessage = "None found."): void {
  if (items.length === 0) {
    console.log(emptyMessage);
    return;
  }

  for (const item of items) {
    console.log(`- ${item}`);
  }
}

function parseRoutes(): RouteEntry[] {
  const routeFiles = collectFiles(path.join(srcRoot, "routes"), ".ts");
  const routePattern = /router\.(get|post|put|patch|delete|options|head|all|use)\(\s*["'`]([^"'`]+)["'`]/g;

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

function inferStructure(): string[] {
  const directories = [
    "src/app",
    "src/config",
    "src/exceptions",
    "src/http/controllers",
    "src/http/middleware",
    "src/http/requests",
    "src/http/resources",
    "src/routes",
  ];

  return directories.map((directory) => {
    return `${directory}${fileExists(directory) ? "" : " (missing)"}`;
  });
}

function printAbout(): void {
  const pkg = readJson<PackageJson>("package.json");
  const tsconfig = readJson<TsConfig>("tsconfig.json");
  const dependencies = Object.keys(pkg.dependencies ?? {});
  const devDependencies = Object.keys(pkg.devDependencies ?? {});
  const aliases = Object.entries(tsconfig.compilerOptions?.paths ?? {}).map(([alias, targets]) => {
    return `${alias} -> ${targets.join(", ")}`;
  });

  console.log(`${pkg.name ?? "server"} ${pkg.version ?? ""}`.trim());
  console.log("Express + TypeScript API with Laravel-style project conventions.");

  printSection("Framework");
  printList([
    `express ${pkg.dependencies?.express ?? "not installed"}`,
    `typescript ${pkg.devDependencies?.typescript ?? "not installed"}`,
    `compiled output ${tsconfig.compilerOptions?.outDir ?? "not configured"}`,
  ]);

  printSection("Structure");
  printList(inferStructure());

  printSection("Aliases");
  printList(aliases);

  printSection("Key Commands");
  printList(Object.entries(pkg.scripts ?? {}).map(([name, script]) => `${name}: ${script}`));

  printSection("Dependencies");
  printList(dependencies);

  printSection("Dev Dependencies");
  printList(devDependencies);
}

function printRoutes(): void {
  const routes = parseRoutes();

  printSection("Route Files");
  printList(collectFiles(path.join(srcRoot, "routes"), ".ts").map(relative));

  printSection("Discovered Router Registrations");
  if (routes.length === 0) {
    console.log("No router registrations found.");
    return;
  }

  for (const route of routes) {
    console.log(`${route.method.padEnd(7)} ${route.path.padEnd(16)} ${route.file}`);
  }
}

function printDoctor(): void {
  const checks = [
    ["BOOST.md", fileExists("BOOST.md")],
    ["package.json", fileExists("package.json")],
    ["tsconfig.json", fileExists("tsconfig.json")],
    ["src/app/Server.ts", fileExists("src/app/Server.ts")],
    ["src/exceptions/Handler.ts", fileExists("src/exceptions/Handler.ts")],
    ["src/http/middleware/errorHandler.ts", fileExists("src/http/middleware/errorHandler.ts")],
    ["src/http/middleware/notFound.ts", fileExists("src/http/middleware/notFound.ts")],
  ] as const;

  printSection("Boost Doctor");
  for (const [name, passed] of checks) {
    console.log(`${passed ? "OK " : "ERR"} ${name}`);
  }
}

switch (command) {
  case "about":
    printAbout();
    break;
  case "routes":
    printRoutes();
    break;
  case "doctor":
    printDoctor();
    break;
  default:
    console.error(`Unknown boost command: ${command}`);
    console.error("Available commands: about, routes, doctor");
    process.exitCode = 1;
}
