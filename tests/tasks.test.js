import request from "supertest";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import Task from "../src/models/Task.js";
import app from "../src/app.js";

let token;
let taskId;

beforeAll(async () => {
  dotenv.config();
  await connectDB();
  await User.deleteMany({});
  await Task.deleteMany({});

  // Register
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Task User",
      email: "task@example.com",
      password: "123456",
    });

  // Login
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "task@example.com",
      password: "123456",
    });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Task Routes", () => {
  it("should not allow access without token", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.statusCode).toBe(401);
  });

  it("should create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "Testing",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test Task");
    taskId = res.body._id;
  });

  it("should get user tasks only", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});    