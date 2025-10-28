import { exec } from "child_process";

exec("npx ts-node --esm prisma/seed.ts", (err, stdout, stderr) => {
  if (err) {
    console.error("❌ Seed failed:", stderr);
    process.exit(1);
  } else {
    console.log(stdout);
  }
});
