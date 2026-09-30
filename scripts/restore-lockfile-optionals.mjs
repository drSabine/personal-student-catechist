// Run after `npm install <package>` on Windows, before committing package-lock.json.
// Windows npm drops optional entries only other systems need (@emnapi, sharp and swc Linux
// binaries), which breaks `npm ci` on Linux CI. This restores the ones the committed lockfile had.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const committed = JSON.parse(
  execFileSync("git", ["show", "HEAD:package-lock.json"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }),
);
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));

const lost = Object.keys(committed.packages).filter(
  (name) => name !== "" && committed.packages[name].optional === true && !(name in lock.packages),
);

if (lost.length === 0) {
  console.log("Nothing to restore.");
} else {
  const names = Object.keys(lock.packages);
  for (const name of lost) {
    // npm keeps entries sorted by name.
    const at = names.findIndex((other) => other !== "" && other.localeCompare(name, "en") > 0);
    names.splice(at < 0 ? names.length : at, 0, name);
  }
  lock.packages = Object.fromEntries(names.map((name) => [name, lock.packages[name] ?? committed.packages[name]]));
  writeFileSync("package-lock.json", `${JSON.stringify(lock, null, 2)}\n`);
  console.log(`Restored ${lost.length} optional entries:\n${lost.map((name) => `  ${name}`).join("\n")}`);
}
