import { execSync } from "child_process"
import { readdirSync } from "fs"
import { join } from "node:path"

const root = join(import.meta.dirname, "..")
const pluginsDir = join(root, "plugins")

const pkgFiles = [join(root, "package.json")]

const dirs = readdirSync(pluginsDir, { withFileTypes: true }).filter(
  (d) => d.isDirectory() && !d.name.startsWith("."),
)

for (const dir of dirs) {
  const pkg = join(pluginsDir, dir.name, "package.json")
  pkgFiles.push(pkg)
}

console.log("[bumpp] Files:", pkgFiles.join(" "))

execSync(`npx bumpp ${pkgFiles.join(" ")}`, { stdio: "inherit" })
