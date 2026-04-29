import { Command } from "@commander-js/extra-typings";
import { renderRouteReport } from "@console/output";

export function registerRoutesCommand(program: Command): void {
  program
    .command("routes")
    .description("Print discovered route registrations")
    .action(() => {
      renderRouteReport();
    });
}
