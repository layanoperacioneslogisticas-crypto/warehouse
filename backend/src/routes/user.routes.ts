import { Router } from "express";
import { Role } from "@prisma/client";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { userController } from "../controllers/crud.controller.js";

const router = Router();

router.use(authMiddleware, requireRoles(Role.ADMIN));
router.get("/", asyncHandler(userController.list));
router.post("/", asyncHandler(userController.create));
router.put("/:id", asyncHandler(userController.update));
router.delete("/:id", asyncHandler(userController.remove));

export default router;

