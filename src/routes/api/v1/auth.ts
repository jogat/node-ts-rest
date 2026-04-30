import { Router } from "express";
import { AuthController } from "@http/controllers/AuthController";
import { asyncHandler, auth, validate } from "@http/middleware";
import { LoginRequest, RegisterRequest } from "@http/requests";

export function registerAuthRoutes(router: Router, authController: AuthController): void {
  router.post("/auth/register", validate(RegisterRequest), asyncHandler(authController.register));
  router.post("/auth/login", validate(LoginRequest), asyncHandler(authController.login));
  router.get("/auth/me", auth, asyncHandler(authController.me));
  router.post("/auth/logout", auth, asyncHandler(authController.logout));
}
