import { discoverRoutes, getDatabaseStatus, getDoctorChecks, getProjectSummary } from "@console/support";

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

export function renderProjectOverview(): void {
  const summary = getProjectSummary();

  console.log(`${summary.name} ${summary.version}`.trim());
  console.log("Express + TypeScript API with Laravel-style project conventions.");

  printSection("Framework");
  printList(summary.framework);

  printSection("Structure");
  printList(summary.structure);

  printSection("Aliases");
  printList(summary.aliases);

  printSection("Key Commands");
  printList(summary.commands);

  printSection("Dependencies");
  printList(summary.dependencies);

  printSection("Dev Dependencies");
  printList(summary.devDependencies);
}

export function renderRouteReport(): void {
  const routes = discoverRoutes();
  const routeFiles = routes
    .map((route) => route.file)
    .filter((file, index, files) => files.indexOf(file) === index);

  printSection("Route Files");
  printList(routeFiles);

  printSection("Discovered Router Registrations");
  if (routes.length === 0) {
    console.log("No router registrations found.");
    return;
  }

  for (const route of routes) {
    console.log(`${route.method.padEnd(7)} ${route.path.padEnd(16)} ${route.file}`);
  }
}

export function renderDoctorReport(): void {
  printSection("Boost Doctor");

  for (const check of getDoctorChecks()) {
    console.log(`${check.exists ? "OK " : "ERR"} ${check.path}`);
  }
}

export async function renderDatabaseStatusReport(): Promise<void> {
  const status = await getDatabaseStatus();

  printSection("Database Status");
  console.log("Completed migrations");
  printList(status.completed);
  console.log("Pending migrations");
  printList(status.pending);
}
