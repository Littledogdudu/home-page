import { execSync } from "child_process"
import { readdirSync } from "fs"
import { join } from "node:path"

const root = join(import.meta.dirname, "..", "..", "..")
const pluginsDir = join(root, "plugins")

const dirs = readdirSync(pluginsDir, { withFileTypes: true }).filter(
  (d) => d.isDirectory() && !d.name.startsWith("."),
)

if (dirs.length === 0) {
  console.log("[build:plugins] No plugin directories found.")
  process.exit(0)
}

let failed = false

for (const dir of dirs) {
  console.log(`\n[build:plugins] Building ${dir.name}...`)
  try {
    execSync("npm run build", { cwd: join(pluginsDir, dir.name), stdio: "inherit" })
  } catch {
    console.error(`[build:plugins] ❌ ${dir.name} failed`)
    failed = true
  }
}

if (failed) {
  console.error("\n[build:plugins] Some plugins failed to build.")
  process.exit(1)
}

console.log("\n[build:plugins] All plugins built successfully.")
