import { renderDoctorReport, renderProjectOverview, renderRouteReport } from "../src/console/output";

const command = process.argv[2] ?? "about";

switch (command) {
  case "about":
    renderProjectOverview();
    break;
  case "routes":
    renderRouteReport();
    break;
  case "doctor":
    renderDoctorReport();
    break;
  default:
    console.error(`Unknown boost command: ${command}`);
    console.error("Available commands: about, routes, doctor");
    process.exitCode = 1;
}
