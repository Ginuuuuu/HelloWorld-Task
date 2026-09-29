import path from 'node:path';
import {
  access,
  chmod,
  copyFile,
  lstat,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';

import {
  createReadStream,
  createWriteStream,
} from 'node:fs';
import { createReadStream as streamRead } from "node:fs";
import { createWriteStream as streamWrite } from "node:fs";
import { pipeline } from "node:stream/promises";
import { PathGuard } from "./path-guard.js";
import { OperationLog } from "./operation-log.js";

const INTERNAL_DIR = ".file-manager";

export class FileManager {
  constructor(root, stateDir) {
    this.root = path.resolve(root);
    this.cwd = this.root;
    this.guard = new PathGuard(this.root);
    this.log = new OperationLog(stateDir);
    this.history = [];
    this.redoStack = [];
    this.running = new Set();
  }

  async initialize() {
    await mkdir(this.root, { recursive: true });
    await mkdir(path.join(this.root, INTERNAL_DIR), { recursive: true });
    await this.log.initialize();
  }

  async shutdown() {
    await this.log.persist();
  }

  displayCwd() {
    const relative = path.relative(this.root, this.cwd);
    return relative ? `/${relative.split(path.sep).join("/")}` : "/";
  }

  async execute(command) {
    const { name, args, options } = command;

    switch (name) {
      case "ls": return this.cmdLs(options);
      case "cd": return this.cmdCd(args);
      case "pwd": return console.log(this.displayCwd());
      case "mkdir": return this.cmdMkdir(args);
      case "touch": return this.cmdTouch(args);
      case "rename": return this.cmdRename(args);
      case "copy": return this.cmdCopy(args);
      case "move": return this.cmdMove(args);
      case "delete": return this.cmdDelete(args);
      case "cat": return this.cmdCat(args);
      case "find": return this.cmdFind(args, options);
      case "info": return this.cmdInfo(args);
      case "tree": return this.cmdTree(args, options);
      case "history": return this.cmdHistory();
      case "undo": return this.cmdUndo();
      case "redo": return this.cmdRedo();
      default:
        throw new Error(`Unknown command "${name}". Type "help" for available commands.`);
    }
  }

  resolveFromCwd(input = ".") {
    return this.guard.resolve(path.isAbsolute(input) ? input : path.resolve(this.cwd, input));
  }

  async cmdLs(options) {
    const entries = await readdir(this.cwd, { withFileTypes: true });
    let rows = [];

    for (const entry of entries) {
      if (!options.hidden && entry.name.startsWith(".")) continue;
      const full = path.join(this.cwd, entry.name);
      const info = await lstat(full);
      const isDir = info.isDirectory();

      if (options.files && isDir) continue;
      if (options.dirs && !isDir) continue;

      rows.push({
        name: entry.name,
        type: isDir ? "DIR" : entry.isSymbolicLink() ? "LINK" : "FILE",
        size: info.size,
        mtime: info.mtimeMs
      });
    }

    const sort = options.sort || "name";
    const order = options.order === "desc" ? -1 : 1;

    rows.sort((a, b) => {
      let result;
      if (sort === "size") result = a.size - b.size;
      else if (sort === "time") result = a.mtime - b.mtime;
      else result = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      return result * order;
    });

    if (!rows.length) {
      console.log("(empty)");
      return;
    }

    console.log("TYPE       SIZE       MODIFIED              NAME");
    console.log("----------------------------------------------------------");
    for (const row of rows) {
      console.log(
        `${row.type.padEnd(10)} ${formatBytes(row.size).padEnd(10)} ${new Date(row.mtime).toLocaleString().padEnd(21)} ${row.name}`
      );
    }
  }

  async cmdCd(args) {
    if (args.length !== 1) throw new Error("Usage: cd <path>");
    const target = await this.guard.assertExistingInside(this.resolveFromCwd(args[0]));
    const info = await stat(target);
    if (!info.isDirectory()) throw new Error("Target is not a directory.");
    this.cwd = target;
  }

  async cmdMkdir(args) {
    if (!args.length) throw new Error("Usage: mkdir <name>");
    const target = await this.guard.assertDestinationInside(this.resolveFromCwd(args[0]));
    await mkdir(target, { recursive: false });
    await this.record({
      type: "mkdir",
      path: target
    });
    console.log(`Created directory: ${this.relative(target)}`);
  }

  async cmdTouch(args) {
    if (!args.length) throw new Error("Usage: touch <name>");
    const target = await this.guard.assertDestinationInside(this.resolveFromCwd(args[0]));

    try {
      await access(target);
      throw new Error("A file or directory with that name already exists.");
    } catch (error) {
      if (error.message.includes("already exists")) throw error;
      if (error.code !== "ENOENT") throw error;
    }

    await writeFile(target, "", { flag: "wx" });
    await this.record({ type: "create", path: target });
    console.log(`Created file: ${this.relative(target)}`);
  }

  async cmdRename(args) {
    if (args.length !== 2) throw new Error("Usage: rename <source> <destination>");
    const source = await this.guard.assertExistingInside(this.resolveFromCwd(args[0]));
    const destination = await this.guard.assertDestinationInside(this.resolveFromCwd(args[1]));
    await ensureNoDuplicate(destination);
    await rename(source, destination);
    await this.record({ type: "rename", source, destination });
    console.log(`Renamed to: ${this.relative(destination)}`);
  }

  async cmdCopy(args) {
    if (args.length !== 2) throw new Error("Usage: copy <source> <destination>");
    const source = await this.guard.assertExistingInside(this.resolveFromCwd(args[0]));
    let destination = await this.guard.assertDestinationInside(this.resolveFromCwd(args[1]));
    const sourceInfo = await lstat(source);

    if (await exists(destination)) {
      const destInfo = await lstat(destination);
      if (destInfo.isDirectory()) destination = path.join(destination, path.basename(source));
    }

    destination = await this.guard.assertDestinationInside(destination);
    await ensureNoDuplicate(destination);

    const operation = { type: "copy", source, destination, status: "in-progress" };
    await this.log.append(operation);

    this.running.add(destination);
    try {
      if (sourceInfo.isDirectory()) {
        await copyDirectory(source, destination, (p) => this.showProgress(p));
      } else if (sourceInfo.isFile()) {
        await copyFileWithProgress(source, destination, (p) => this.showProgress(p));
      } else {
        throw new Error("Unsupported source type for copy.");
      }

      operation.status = "completed";
      await this.record(operation);
      console.log(`\nCopied: ${this.relative(source)} -> ${this.relative(destination)}`);
    } catch (error) {
      operation.status = "failed";
      await this.log.append(operation);
      try { await rm(destination, { recursive: true, force: true }); } catch {}
      throw error;
    } finally {
      this.running.delete(destination);
    }
  }

  async cmdMove(args) {
    if (args.length !== 2) throw new Error("Usage: move <source> <destination>");
    const source = await this.guard.assertExistingInside(this.resolveFromCwd(args[0]));
    let destination = await this.guard.assertDestinationInside(this.resolveFromCwd(args[1]));

    if (await exists(destination)) {
      const info = await lstat(destination);
      if (info.isDirectory()) destination = path.join(destination, path.basename(source));
    }

    destination = await this.guard.assertDestinationInside(destination);
    await ensureNoDuplicate(destination);

    await this.log.append({ type: "move", source, destination, status: "in-progress" });
    await rename(source, destination);
    await this.record({ type: "move", source, destination, status: "completed" });

    console.log(`Moved: ${this.relative(source)} -> ${this.relative(destination)}`);
  }

  async cmdDelete(args) {
    if (args.length !== 1) throw new Error("Usage: delete <path>");
    const target = await this.guard.assertExistingInside(this.resolveFromCwd(args[0]));
    const info = await lstat(target);

    if (info.isDirectory()) {
      const confirmed = await confirm(`Delete directory "${this.relative(target)}" recursively? [y/N] `);
      if (!confirmed) {
        console.log("Cancelled.");
        return;
      }
    }

    const backup = path.join(this.root, INTERNAL_DIR, `trash-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await rename(target, backup);
    await this.record({ type: "delete", original: target, backup });
    console.log(`Deleted: ${this.relative(target)}`);
  }

  async cmdCat(args) {
    if (args.length !== 1) throw new Error("Usage: cat <file>");
    const target = await this.guard.assertExistingInside(this.resolveFromCwd(args[0]));
    const info = await stat(target);
    if (!info.isFile()) throw new Error("cat only supports files.");
    process.stdout.write(await readFile(target, "utf8"));
    if (!String(await readFile(target, "utf8")).endsWith("\n")) console.log();
  }

  async cmdFind(args, options) {
    const start = args[0] ? await this.guard.assertExistingInside(this.resolveFromCwd(args[0])) : this.cwd;
    const nameFilter = options.name;
    const extFilter = options.ext;
    const caseSensitive = Boolean(options["case-sensitive"]);
    const results = [];

    await walk(start, async (full, info) => {
      if (full === this.root) return;
      const name = path.basename(full);
      const haystack = caseSensitive ? name : name.toLowerCase();

      let matches = true;

      if (nameFilter !== undefined) {
        const needle = caseSensitive ? String(nameFilter) : String(nameFilter).toLowerCase();
        matches = haystack.includes(needle);
      }

      if (matches && extFilter !== undefined) {
        matches = path.extname(name) === extFilter;
      }

      if (matches) results.push(this.relative(full));
    });

    if (!results.length) console.log("No matches.");
    else results.forEach((item) => console.log(item));
  }

  async cmdInfo(args) {
    if (args.length !== 1) throw new Error("Usage: info <path>");
    const target = await this.guard.assertExistingInside(this.resolveFromCwd(args[0]));
    const info = await lstat(target);

    console.log(`Name:        ${path.basename(target)}`);
    console.log(`Type:        ${info.isDirectory() ? "Directory" : info.isSymbolicLink() ? "Symbolic Link" : "File"}`);
    console.log(`Size:        ${formatBytes(info.size)}`);
    console.log(`Extension:   ${info.isDirectory() ? "-" : path.extname(target) || "-"}`);
    console.log(`Created:     ${info.birthtime.toLocaleString()}`);
    console.log(`Modified:    ${info.mtime.toLocaleString()}`);
    console.log(`Permissions: ${permissions(info.mode)}`);
    console.log(`Path:        ${this.relative(target)}`);
  }

  async cmdTree(args, options) {
    const start = args[0] ? await this.guard.assertExistingInside(this.resolveFromCwd(args[0])) : this.cwd;
    const depth = options.depth === undefined ? Infinity : Number(options.depth);
    if (!Number.isInteger(depth) || depth < 0) throw new Error("--depth must be a non-negative integer.");

    console.log(path.basename(start) || start);
    await treeWalk(start, "", depth, this.root);
  }

  cmdHistory() {
    if (!this.log.records.length) {
      console.log("No operation history.");
      return;
    }
    for (const record of this.log.records.slice(-50)) {
      console.log(`${record.timestamp} | ${record.type} | ${record.status || "completed"}`);
    }
  }

  async cmdUndo() {
    const operation = [...this.history].reverse().find((item) => !item.undone);
    if (!operation) {
      console.log("Nothing to undo.");
      return;
    }

    await this.applyInverse(operation);
    operation.undone = true;
    this.redoStack.push(operation);
    console.log(`Undid ${operation.type}.`);
  }

  async cmdRedo() {
    const operation = this.redoStack.pop();
    if (!operation) {
      console.log("Nothing to redo.");
      return;
    }

    await this.applyForward(operation);
    operation.undone = false;
    console.log(`Redid ${operation.type}.`);
  }

  async applyInverse(op) {
    switch (op.type) {
      case "mkdir":
      case "create":
        await rm(op.path, { recursive: true, force: true });
        break;
      case "rename":
      case "move":
        await rename(op.destination, op.source);
        break;
      case "copy":
        await rm(op.destination, { recursive: true, force: true });
        break;
      case "delete":
        await rename(op.backup, op.original);
        break;
      default:
        throw new Error(`Undo is not supported for ${op.type}.`);
    }
  }

  async applyForward(op) {
    switch (op.type) {
      case "mkdir":
        await mkdir(op.path);
        break;
      case "create":
        await writeFile(op.path, "");
        break;
      case "rename":
      case "move":
        await rename(op.source, op.destination);
        break;
      case "copy": {
        const info = await lstat(op.source);
        if (info.isDirectory()) await copyDirectory(op.source, op.destination);
        else await copyFileWithProgress(op.source, op.destination, () => {});
        break;
      }
      case "delete":
        await rename(op.original, op.backup);
        break;
      default:
        throw new Error(`Redo is not supported for ${op.type}.`);
    }
  }

  async record(operation) {
    const normalized = { ...operation, status: operation.status || "completed", undone: false };
    this.history.push(normalized);
    this.redoStack = [];
    await this.log.append(normalized);
  }

  showProgress(progress) {
    if (!progress || !Number.isFinite(progress.percent)) return;
    const width = 30;
    const filled = Math.round(width * progress.percent / 100);
    process.stdout.write(`\r[${"=".repeat(filled)}${" ".repeat(width - filled)}] ${progress.percent.toFixed(1)}%`);
  }

  relative(full) {
    const rel = path.relative(this.root, full);
    return rel ? rel.split(path.sep).join("/") : "/";
  }
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function ensureNoDuplicate(target) {
  if (await exists(target)) {
    throw new Error(`Destination already exists: ${target}`);
  }
}

async function copyFileWithProgress(source, destination, onProgress) {
  const info = await stat(source);
  const total = info.size;
  let transferred = 0;

  const reader = streamRead(source);
  const writer = streamWrite(destination, { flags: "wx" });

  reader.on("data", (chunk) => {
    transferred += chunk.length;
    const percent = total === 0 ? 100 : (transferred / total) * 100;
    onProgress({ transferred, total, percent });
  });

  await pipeline(reader, writer);
  onProgress({ transferred: total, total, percent: 100 });
}

async function copyDirectory(source, destination, onProgress) {
  await mkdir(destination, { recursive: false });
  const entries = await readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const src = path.join(source, entry.name);
    const dest = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(src, dest, onProgress);
    } else if (entry.isFile()) {
      await copyFileWithProgress(src, dest, onProgress);
    } else if (entry.isSymbolicLink()) {
      // Do not follow links. Copying links across platforms can have different
      // privileges, so we safely skip them rather than traversing them.
      console.log(`\nSkipped symbolic link: ${entry.name}`);
    }
  }
}

async function walk(dir, callback) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === INTERNAL_DIR && dir === path.dirname(dir)) continue;

    const full = path.join(dir, entry.name);
    const info = await lstat(full);
    await callback(full, info);

    if (info.isDirectory()) {
      await walk(full, callback);
    }
  }
}

async function treeWalk(dir, prefix, remainingDepth, root) {
  if (remainingDepth === 0) return;

  const entries = (await readdir(dir, { withFileTypes: true }))
    .filter((e) => !e.name.startsWith(".") && e.name !== INTERNAL_DIR)
    .sort((a, b) => a.name.localeCompare(b.name));

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const last = i === entries.length - 1;
    const branch = last ? "└── " : "├── ";
    console.log(`${prefix}${branch}${entry.name}`);

    if (entry.isDirectory()) {
      await treeWalk(
        path.join(dir, entry.name),
        `${prefix}${last ? "    " : "│   "}`,
        remainingDepth - 1,
        root
      );
    }
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function permissions(mode) {
  const bits = [
    0o400, 0o200, 0o100,
    0o040, 0o020, 0o010,
    0o004, 0o002, 0o001
  ];
  const chars = ["r", "w", "x"];
  return bits.map((bit, index) => (mode & bit) ? chars[index % 3] : "-").join("");
}

function confirm(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(["y", "yes"].includes(answer.trim().toLowerCase()));
    });
  });
}
