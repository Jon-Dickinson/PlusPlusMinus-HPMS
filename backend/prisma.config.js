// C:\Development\PlusPlusMinus-HPMS\backend\prisma.config.js
const { defineConfig, env } = require("prisma/config"); // Use require

module.exports = defineConfig({ // Use module.exports as the only export
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    engine: "classic",
    datasource: {
        url: env("DATABASE_URL"),
    },
});
