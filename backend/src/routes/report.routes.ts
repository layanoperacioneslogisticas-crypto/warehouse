import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import * as reportController from "../controllers/report.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/dashboard", asyncHandler(reportController.dashboard));
router.get("/occupancy", asyncHandler(reportController.occupancy));
router.get("/blocked-locations", asyncHandler(reportController.blocked));
router.get("/export-locations", asyncHandler(reportController.exportLocations));
router.get("/export-inventory", asyncHandler(reportController.exportInventory));

export default router;

