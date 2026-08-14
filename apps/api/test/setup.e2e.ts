import { beforeAll, afterAll } from "vitest";
import { GenericContainer, StartedTestContainer } from "testcontainers";

let mongoContainer: StartedTestContainer;
let redisContainer: StartedTestContainer;

beforeAll(async () => {
  // Start MongoDB container
  mongoContainer = await new GenericContainer("mongo:6.0.4")
    .withExposedPorts(27017)
    .start();
  
  process.env.MONGODB_URI = `mongodb://${mongoContainer.getHost()}:${mongoContainer.getMappedPort(27017)}/e2e-test`;

  // Start Redis container
  redisContainer = await new GenericContainer("redis:7.0-alpine")
    .withExposedPorts(6379)
    .start();
  
  process.env.REDIS_URL = `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`;
});

afterAll(async () => {
  if (mongoContainer) {
    await mongoContainer.stop();
  }
  if (redisContainer) {
    await redisContainer.stop();
  }
});
