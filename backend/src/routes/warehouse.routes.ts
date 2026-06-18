import { Router } from "express";
import { Role } from "@prisma/client";
import { warehouseController } from "../controllers/crud.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authMiddleware);
router.get("/", asyncHandler(warehouseController.list));
router.get("/:id", asyncHandler(warehouseController.get));
router.post("/", requireRoles(Role.ADMIN, Role.SUPERVISOR), asyncHandler(warehouseController.create));
router.put("/:id", requireRoles(Role.ADMIN, Role.SUPERVISOR), asyncHandler(warehouseController.update));
router.delete("/:id", requireRoles(Role.ADMIN), asyncHandler(warehouseController.remove));

export default router;

