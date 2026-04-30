import { Command } from "@commander-js/extra-typings";
import { closeConsoleDatabase, getProjectSummary, rollbackMigrations, runMigrations, seedDatabase } from "@console/support";
import { renderDatabaseStatusReport, renderDoctorReport, renderProjectOverview } from "@console/output";
import { registerHelloCommand } from "@console/commands/HelloCommand";
import { registerRoutesCommand } from "@console/commands/RoutesCommand";
import { registerUserCommand } from "@console/commands/UserCommand";

function buildDatabaseCommand(): Command {
  const database = new Command("db").description("Database maintenance commands");

  database
    .command("status")
    .description("Show migration status")
    .action(async () => {
      try {
        await renderDatabaseStatusReport();
      } finally {
        await closeConsoleDatabase();
      }
    });

  database
    .command("migrate")
    .description("Run pending migrations")
    .action(async () => {
      try {
        await runMigrations();
        console.log("Migrations complete.");
      } finally {
        await closeConsoleDatabase();
      }
    });

  database
    .command("rollback")
    .description("Roll back the latest migration batch")
    .action(async () => {
      try {
        await rollbackMigrations();
        console.log("Migration batch rolled back.");
      } finally {
        await closeConsoleDatabase();
      }
    });

  database
    .command("seed")
    .description("Run database seeders")
    .action(async () => {
      try {
        await seedDatabase();
        console.log("Database seeders complete.");
      } finally {
        await closeConsoleDatabase();
      }
    });

  return database;
}

export function createArtisanProgram(): Command {
  const summary = getProjectSummary();

  const program = new Command()
    .name("artisan")
    .description("Laravel-like console commands for the Portfolio 2025 server")
    .version(summary.version)
    .showHelpAfterError()
    .showSuggestionAfterError();

  program
    .command("about")
    .description("Print project context")
    .action(() => {
      renderProjectOverview();
    });

  registerRoutesCommand(program);
  registerUserCommand(program);

  program
    .command("doctor")
    .description("Run project structure checks")
    .action(() => {
      renderDoctorReport();
    });

  registerHelloCommand(program);

  program.addCommand(buildDatabaseCommand());

  return program;
}

export async function runArtisan(argv = process.argv): Promise<void> {
  const program = createArtisanProgram();

  try {
    await program.parseAsync(argv);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  }
}

if (require.main === module) {
  void runArtisan();
}
