"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialRolesSeeder = void 0;
exports.initialRolesSeeder = {
    name: "001_initial_roles",
    run: async (dbMain) => {
        // Check if roles already exist
        const existingRoles = await dbMain
            .selectFrom("roles")
            .selectAll()
            .execute();
        if (existingRoles.length > 0) {
            console.log("Roles already seeded, skipping...");
            return;
        }
        // Insert initial roles
        await dbMain
            .insertInto("roles")
            .values([
            {
                code: "ADMIN",
                name: "Administrator",
            },
            {
                code: "EMPLOYEE",
                name: "Employee",
            },
        ])
            .execute();
        console.log("✓ Seeded initial roles");
    },
};
