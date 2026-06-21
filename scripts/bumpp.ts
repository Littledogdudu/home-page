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

const version = process.argv[2] // 应用传入的版本号，没有就是 undefined

const cmd = version
  ? `npx bumpp ${version} ${pkgFiles.join(" ")} --yes`
  : `npx bumpp ${pkgFiles.join(" ")}`

console.log("[bumpp]", version ? `bump to ${version}` : "interactive mode")
execSync(cmd, { stdio: "inherit" })
