"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testUsersSeeder = void 0;
exports.testUsersSeeder = {
    name: "002_test_users",
    run: async (dbMain) => {
        // Get role IDs
        const adminRole = await dbMain
            .selectFrom("roles")
            .select("id")
            .where("code", "=", "ADMIN")
            .executeTakeFirst();
        const employeeRole = await dbMain
            .selectFrom("roles")
            .select("id")
            .where("code", "=", "EMPLOYEE")
            .executeTakeFirst();
        if (!adminRole || !employeeRole) {
            throw new Error("Roles not found. Please run roles seeder first.");
        }
        // Check if test users already exist
        const existingUsers = await dbMain
            .selectFrom("users")
            .selectAll()
            .execute();
        if (existingUsers.length > 0) {
            console.log("Users already seeded, skipping...");
            return;
        }
        // Insert test users
        const users = await dbMain
            .insertInto("users")
            .values([
            {
                email: "admin@dexa.com",
                password_hash: "$2b$10$rN9z7VPvHlGFQ8Z9rN9z7ObGQWyY8/xFgGQWyY8/xFgGQWyY8/xFgG", // password: admin123
                role_id: adminRole.id,
                is_active: true,
            },
            {
                email: "employee@dexa.com",
                password_hash: "$2b$10$rN9z7VPvHlGFQ8Z9rN9z7ObGQWyY8/xFgGQWyY8/xFgGQWyY8/xFgG", // password: employee123
                role_id: employeeRole.id,
                is_active: true,
            },
        ])
            .returning(["id", "email"])
            .execute();
        // Create employee profiles for test users
        const employeeUser = users.find((u) => u.email === "employee@company.com");
        if (employeeUser) {
            await dbMain
                .insertInto("employee_profiles")
                .values({
                user_id: employeeUser.id,
                full_name: "John Doe",
                position: "Software Engineer",
                phone_number: "081234567890",
                employee_number: "EMP001",
                date_joined: new Date("2024-01-01"),
            })
                .execute();
        }
        console.log("✓ Seeded test users and profiles");
    },
};
