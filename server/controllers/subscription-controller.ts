import { RequestHandler } from "express";
import { User } from "../models/User";
import { asyncHandler, HttpError } from "../utils/http";
import {
  checkSubscriptionStatus,
  getMyAccount,
  deactivateSubscription,
} from "../services/mselfistar-service";

export const checkStatusController: RequestHandler = asyncHandler(async (req, res) => {
  const phone = String(req.query.msisdn || req.query.phone || "").trim();
  if (!phone) {
    throw new HttpError(400, "Mobile number is required");
  }

  const result = await checkSubscriptionStatus(phone);
  if (result.subscribed) {
    res.json({ status: 1 });
    return;
  }

  res.json({ status: 0, redirectUrl: "redirectUrl" in result ? result.redirectUrl : undefined });
});

export const myAccountController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const user = await User.findById(req.user._id).select("phone").lean();
  if (!user?.phone) {
    throw new HttpError(400, "No mobile number linked to this account");
  }

  const account = await getMyAccount(user.phone);
  res.json(account);
});

export const unsubscribeController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const user = await User.findById(req.user._id).select("phone").lean();
  if (!user?.phone) {
    throw new HttpError(400, "No mobile number linked to this account");
  }

  const result = await deactivateSubscription(user.phone);
  if (result.success) {
    res.json({ status: 1, redirectUrl: result.redirectUrl });
    return;
  }

  res.json({ status: 0 });
});
