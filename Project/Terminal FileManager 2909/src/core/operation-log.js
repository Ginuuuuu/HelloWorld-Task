import { mkdir, readFile, writeFile, rename as fsRename } from "node:fs/promises";
import path from "node:path";

export class OperationLog {
  constructor(stateDir) {
    this.stateDir = stateDir;
    this.file = path.join(stateDir, "operations.json");
    this.records = [];
  }

  async initialize() {
    await mkdir(this.stateDir, { recursive: true });

    try {
      const data = await readFile(this.file, "utf8");
      this.records = JSON.parse(data);
      if (!Array.isArray(this.records)) this.records = [];
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      this.records = [];
      await this.persist();
    }
  }

  async append(record) {
    this.records.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      ...record
    });
    await this.persist();
  }

  async persist() {
    const temp = `${this.file}.tmp`;
    await writeFile(temp, JSON.stringify(this.records, null, 2), "utf8");
    await fsRename(temp, this.file);
  }
}
