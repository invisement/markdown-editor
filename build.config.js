import { build } from "esbuild"

// ESM

build({ entryPoints: ["./src/**/*.ts"], outdir: "./dist", format: "esm" })
build({ entryPoints: ["./src/style.css"], outdir: "./dist", format: "esm" })

// BROWSER

const index = ["./src/index.ts"]
const style = ["./src/style.css"]

build({ entryPoints: index, outfile: "./browser/markdown-editor.js", bundle: true })
build({ entryPoints: style, outfile: "./browser/markdown-editor.css" })

build({ entryPoints: index, outfile: "./browser/min/markdown-editor.min.js", bundle: true, minify: true })
build({ entryPoints: style, outfile: "./browser/min/markdown-editor.min.css", minify: true })
