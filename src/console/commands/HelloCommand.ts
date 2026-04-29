import { Command } from "@commander-js/extra-typings";

export function registerHelloCommand(program: Command): void {
  program
    .command("hello")
    .description('Print "hello world"')
    .action(() => {
      console.log("hello world");
    });
}
