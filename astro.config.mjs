// VEON demo base: technical setup only. Visual design comes from design/concept.md of each client.
// Styles are inlined and asset URLs are relative ("./_astro/…"), so dist/index.html also opens from disk (file://)
// and from any static host or subfolder without changes.
import { defineConfig } from "astro/config";

export default defineConfig({
  build: { inlineStylesheets: "always", assetsPrefix: "." },
  compressHTML: true,
});
