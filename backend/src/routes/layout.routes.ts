import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { layout } from "../controllers/location.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/warehouse/:warehouseId", asyncHandler(layout));

export default router;

