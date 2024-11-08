import { build } from "esbuild"

// ESM

build({ entryPoints: ["./src/index.ts"], outdir: "./dist", format: "esm", bundle: true })
build({ entryPoints: ["./src/style.css"], outdir: "./dist", format: "esm" })

// BROWSER

const index = ["./src/index.ts"]
const style = ["./src/style.css"]

build({ entryPoints: index, outfile: "./browser/markdown-editor.js", minify: true, bundle: true, target: "es2022", format: "esm" })
build({ entryPoints: style, outfile: "./browser/markdown-editor.css" })

