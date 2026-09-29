import { createInterface } from "node:readline";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { FileManager } from "./core/file-manager.js";
import { CommandParser } from "./cli/parser.js";
import { printHelp, printWelcome } from "./cli/help.js";

const PROJECT_ROOT = process.cwd();
const ROOT = path.resolve(PROJECT_ROOT, "workspace");
const STATE_DIR = path.join(ROOT, ".file-manager");

await mkdir(ROOT, { recursive: true });
await mkdir(STATE_DIR, { recursive: true });

const manager = new FileManager(ROOT, STATE_DIR);
await manager.initialize();

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ""
});

let shuttingDown = false;

function prompt() {
  if (!shuttingDown) {
    rl.setPrompt(`${manager.displayCwd()} > `);
    rl.prompt();
  }
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("\n\nSaving state and shutting down...");
  try {
    await manager.shutdown();
  } catch (error) {
    console.error(`Shutdown warning: ${error.message}`);
  }
  rl.close();
  console.log("Goodbye.");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

rl.on("line", async (line) => {
  const input = line.trim();
  if (!input) {
    prompt();
    return;
  }

  try {
    const command = CommandParser.parse(input);

    if (command.name === "exit" || command.name === "quit") {
      await shutdown();
      return;
    }

    if (command.name === "help") {
      printHelp();
    } else if (command.name === "clear") {
      console.clear();
    } else {
      await manager.execute(command);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }

  prompt();
});

rl.on("close", () => {
  if (!shuttingDown) {
    shutdown();
  }
});

printWelcome(ROOT);
prompt();
