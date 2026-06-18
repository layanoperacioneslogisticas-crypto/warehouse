import { Router } from "express";
import { Role } from "@prisma/client";
import { zoneController } from "../controllers/crud.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authMiddleware);
router.get("/", asyncHandler(zoneController.list));
router.get("/:id", asyncHandler(zoneController.get));
router.post("/", requireRoles(Role.ADMIN, Role.SUPERVISOR), asyncHandler(zoneController.create));
router.put("/:id", requireRoles(Role.ADMIN, Role.SUPERVISOR), asyncHandler(zoneController.update));
router.delete("/:id", requireRoles(Role.ADMIN), asyncHandler(zoneController.remove));

export default router;

