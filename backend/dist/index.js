"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const app_1 = require("./infrastructure/http/app");
async function main() {
    const app = (0, app_1.buildApp)();
    app.listen(env_1.env.port, () => {
        console.log(`AccessGuard backend listening on :${env_1.env.port}`);
    });
}
main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
