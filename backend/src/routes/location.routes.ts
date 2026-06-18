import { Router } from "express";
import multer from "multer";
import { Role } from "@prisma/client";
import * as locationController from "../controllers/location.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const upload = multer({ dest: "tmp/" });
const router = Router();

router.use(authMiddleware);
router.post("/bulk-upload", requireRoles(Role.ADMIN, Role.SUPERVISOR), upload.single("file"), asyncHandler(locationController.upload));
router.get("/", asyncHandler(locationController.list));
router.post("/", requireRoles(Role.ADMIN, Role.SUPERVISOR), asyncHandler(locationController.create));
router.get("/:id", asyncHandler(locationController.get));
router.post("/:id/block", requireRoles(Role.ADMIN, Role.SUPERVISOR), asyncHandler(locationController.block));
router.post("/:id/unblock", requireRoles(Role.ADMIN, Role.SUPERVISOR), asyncHandler(locationController.unblock));
router.put("/:id/coordinates", requireRoles(Role.ADMIN, Role.SUPERVISOR), asyncHandler(locationController.coordinates));
router.get("/:id/qr", asyncHandler(locationController.qr));
router.put("/:id", requireRoles(Role.ADMIN, Role.SUPERVISOR), asyncHandler(locationController.update));
router.delete("/:id", requireRoles(Role.ADMIN), asyncHandler(locationController.remove));

export default router;
