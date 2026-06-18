import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", asyncHandler(authController.login));
router.get("/me", authMiddleware, asyncHandler(authController.me));

export default router;

