const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");

const root = path.resolve(__dirname, "..");
const outdir = path.join(root, "dist-bundle");

const entryPoints = {
  app: path.join(root, "src/app.ts"),
  artisan: path.join(root, "src/console/artisan.ts"),
  worker: path.join(root, "src/worker.ts"),
  scheduler: path.join(root, "src/scheduler.ts"),
};

async function build() {
  fs.rmSync(outdir, { recursive: true, force: true });

  const result = await esbuild.build({
    entryPoints,
    outdir,
    bundle: true,
    platform: "node",
    target: "node20",
    format: "cjs",
    packages: "external",
    sourcemap: true,
    minify: true,
    legalComments: "external",
    metafile: true,
    logLevel: "info",
  });

  fs.writeFileSync(
    path.join(outdir, "meta.json"),
    JSON.stringify(
      {
        strategy: "esbuild bundled application code with external npm packages",
        entrypoints: Object.keys(entryPoints).map((name) => `${name}.js`),
        generatedAt: new Date().toISOString(),
        outputs: result.metafile.outputs,
      },
      null,
      2
    )
  );
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
