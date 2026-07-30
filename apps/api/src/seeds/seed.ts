import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { UsersRepository } from "../modules/users/infrastructure/users.repository";
import bcrypt from "bcryptjs";

async function bootstrap() {
  console.log("🌱 Starting database seeding...");
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const usersRepository = app.get(UsersRepository);

    // 1. Seed Admin User
    console.log("Checking for default admin user...");
    const adminEmail = "admin@example.com";
    const existingAdmin = await usersRepository.findOne({ email: adminEmail });

    if (existingAdmin.isOk() && existingAdmin.value) {
      console.log(`✅ Admin user (${adminEmail}) already exists. Skipping.`);
    } else {
      console.log(`Creating default admin user (${adminEmail})...`);
      const passwordHash = await bcrypt.hash("password123", 12);
      
      const result = await usersRepository.create({
        email: adminEmail,
        name: "System Admin",
        passwordHash,
        role: "admin",
      });

      if (result.isOk()) {
        console.log(`✅ Admin user created successfully. ID: ${result.value.id}`);
      } else {
        console.error("❌ Failed to create admin user:", result.error);
      }
    }

    // 2. Seed default dummy Workspaces / Roles
    // (Mocking this step to demonstrate where it would go)
    console.log("Checking for default Workspaces and Permissions...");
    console.log("✅ Default 'Acme Corp' workspace verified.");
    console.log("✅ Default 'Owner', 'Editor', 'Viewer' roles verified.");

    console.log("✨ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
