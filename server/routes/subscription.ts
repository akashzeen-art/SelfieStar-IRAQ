import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  checkStatusController,
  myAccountController,
  unsubscribeController,
} from "../controllers/subscription-controller";

const router = Router();

router.get("/check-status", checkStatusController);
router.get("/my-account", requireAuth, myAccountController);
router.post("/unsubscribe", requireAuth, unsubscribeController);

export default router;
