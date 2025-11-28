import { Kysely } from "kysely";
import bcrypt from "bcryptjs";
import { DatabaseMain } from "../../src/types";
import { Seeder } from "./index";

export const testUsersSeeder: Seeder = {
  name: "002_test_users",
  run: async (dbMain: Kysely<DatabaseMain>) => {
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

    // Hash password 'password' for both users
    const hashedPassword = await bcrypt.hash("password", 10);
    const users = await dbMain
      .insertInto("users")
      .values([
        {
          email: "admin@dexa.com",
          password_hash: hashedPassword, // password: password
          role_id: adminRole.id,
          is_active: true,
        },
        {
          email: "employee@dexa.com",
          password_hash: hashedPassword, // password: password
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
