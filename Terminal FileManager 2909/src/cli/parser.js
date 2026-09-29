export class CommandParser {
  static parse(input) {
    const tokens = tokenize(input);
    if (!tokens.length) return { name: "", args: [], options: {} };

    const [name, ...rest] = tokens;
    const args = [];
    const options = {};

    for (const token of rest) {
      if (token.startsWith("--")) {
        const raw = token.slice(2);
        const equalIndex = raw.indexOf("=");
        if (equalIndex >= 0) {
          options[raw.slice(0, equalIndex)] = raw.slice(equalIndex + 1);
        } else {
          options[raw] = true;
        }
      } else {
        args.push(token);
      }
    }

    return { name: name.toLowerCase(), args, options, raw: input };
  }
}

function tokenize(input) {
  const tokens = [];
  let current = "";
  let quote = null;
  let escaped = false;

  for (const char of input) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) quote = null;
      else current += char;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (escaped) current += "\\";
  if (quote) throw new Error("Unclosed quote.");
  if (current) tokens.push(current);

  return tokens;
}
