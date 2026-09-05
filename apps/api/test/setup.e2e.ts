import { beforeAll, afterAll } from "vitest";
import { GenericContainer, StartedTestContainer } from "testcontainers";

let postgresContainer: StartedTestContainer;
let redisContainer: StartedTestContainer;

beforeAll(async () => {
  if (process.env.E2E_USE_CONTAINERS !== "true") {
    throw new Error("E2E_USE_CONTAINERS=true is required for API E2E tests.");
  }

  postgresContainer = await new GenericContainer("postgres:16-alpine")
    .withEnvironment({
      POSTGRES_USER: "postgres",
      POSTGRES_PASSWORD: "postgres",
      POSTGRES_DB: "e2e-test",
    })
    .withExposedPorts(5432)
    .start();

  process.env.DATABASE_URL = `postgres://postgres:postgres@${postgresContainer.getHost()}:${postgresContainer.getMappedPort(5432)}/e2e-test`;

  redisContainer = await new GenericContainer("redis:7.0-alpine").withExposedPorts(6379).start();

  process.env.REDIS_URL = `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`;

  const { runMigrations } = await import("../src/infrastructure/database/migrate");
  await runMigrations();
});

afterAll(async () => {
  if (postgresContainer) {
    await postgresContainer.stop();
  }
  if (redisContainer) {
    await redisContainer.stop();
  }
});
