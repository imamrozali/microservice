import { Seeder } from "./index";

// Import all seeders
import { initialRolesSeeder } from "./001_initial_roles";
import { testUsersSeeder } from "./002_test_users";

// Export all seeders in order
export const allSeeders: Seeder[] = [initialRolesSeeder, testUsersSeeder];

// Export individual seeders for convenience
export * from "./001_initial_roles";
export * from "./002_test_users";
export * from "./index";
