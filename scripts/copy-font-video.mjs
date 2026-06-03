import fs from "node:fs";
import path from "node:path";

const src = path.join("app", "assets", "font.mp4");
const dest = path.join("public", "font.mp4");

if (!fs.existsSync(src)) {
  console.warn("[copy-font-video] Missing app/assets/font.mp4");
  process.exit(0);
}

fs.mkdirSync("public", { recursive: true });
fs.copyFileSync(src, dest);
console.log("[copy-font-video] public/font.mp4 ready");
