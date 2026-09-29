import path from "node:path";
import { realpath } from "node:fs/promises";

export class PathGuard {
  constructor(root) {
    this.root = path.resolve(root);
  }

  resolve(input = ".") {
    const value = input || ".";
    const candidate = path.isAbsolute(value)
      ? path.resolve(value)
      : path.resolve(this.root, value);

    this.assertInside(candidate);
    return candidate;
  }

  assertInside(candidate) {
    const resolved = path.resolve(candidate);
    const relative = path.relative(this.root, resolved);

    if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error("Access denied: path is outside the allowed root.");
    }

    return resolved;
  }

  async assertExistingInside(input) {
    const candidate = this.resolve(input);
    let real;
    try {
      real = await realpath(candidate);
    } catch {
      return candidate;
    }

    const rootReal = await realpath(this.root);
    const relative = path.relative(rootReal, real);

    if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error("Access denied: symbolic link resolves outside the allowed root.");
    }

    return candidate;
  }

  async assertDestinationInside(input) {
    const candidate = this.resolve(input);
    const parent = path.dirname(candidate);

    try {
      const realParent = await realpath(parent);
      const rootReal = await realpath(this.root);
      const relative = path.relative(rootReal, realParent);

      if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
        throw new Error("Access denied: destination is outside the allowed root.");
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        // Parent validation will happen once an existing ancestor is found.
        let current = parent;
        while (current !== this.root && current !== path.dirname(current)) {
          try {
            const real = await realpath(current);
            const rootReal = await realpath(this.root);
            const relative = path.relative(rootReal, real);
            if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
              throw new Error("Access denied: destination is outside the allowed root.");
            }
            break;
          } catch (inner) {
            if (inner.code !== "ENOENT") throw inner;
            current = path.dirname(current);
          }
        }
      } else {
        throw error;
      }
    }

    return candidate;
  }
}
