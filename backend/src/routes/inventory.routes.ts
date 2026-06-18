import { Router } from "express";
import { Role } from "@prisma/client";
import * as inventoryController from "../controllers/inventory.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authMiddleware);
router.get("/location/:locationId", asyncHandler(inventoryController.byLocation));
router.post("/assign", requireRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERARIO), asyncHandler(inventoryController.assign));
router.post("/move", requireRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERARIO), asyncHandler(inventoryController.move));
router.delete("/:id", requireRoles(Role.ADMIN, Role.SUPERVISOR), asyncHandler(inventoryController.remove));

export default router;

