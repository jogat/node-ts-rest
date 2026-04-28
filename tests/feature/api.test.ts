import request from "supertest";
import { describe, expect, it } from "vitest";
import { Server } from "../../src/app/Server";

const app = new Server().getExpressApp();

describe("API routes", () => {
  it("returns the test JSON response", async () => {
    const response = await request(app).get("/v1/test");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      fruits: ["apple", "bannana", "grape"],
    });
  });

  it("returns a resource response for a valid test request", async () => {
    const response = await request(app).post("/v1/test").send({
      name: "Josue",
      fruit: "apple",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Test request validated.",
      data: {
        name: "Josue",
        fruit: "apple",
      },
    });
  });

  it("returns validation errors for an invalid test request", async () => {
    const response = await request(app).post("/v1/test").send({
      name: "",
      fruit: "",
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "The given data was invalid.",
      status: 422,
      errors: {
        name: ["Name is required"],
        fruit: ["Fruit is required"],
      },
    });
  });

  it("returns a JSON 404 response for unknown routes", async () => {
    const response = await request(app).get("/v1/missing");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Route not found",
      status: 404,
    });
  });
});
