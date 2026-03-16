import { env } from "./config/env";
import { buildApp } from "./infrastructure/http/app";

async function main() {
  const app = buildApp();
  app.listen(env.port, () => {
    console.log(`AccessGuard backend listening on :${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

