import axios from "axios";
import { env } from "../config/env";
import { HttpError } from "../utils/http";

/** Normalize phone to digits-only msisdn for mselfistar APIs */
export function toMsisdn(phone: string): string {
  return phone.replace(/\D/g, "");
}

function isActiveStatus(status: unknown): boolean {
  return status === 1 || status === "1";
}

function parseRedirectUrl(data: Record<string, unknown>): string | undefined {
  const url = data.redirectUrl;
  return typeof url === "string" && url.length > 0 ? url : undefined;
}

async function callMselfistar<T extends Record<string, unknown>>(
  endpoint: string,
  msisdn: string,
): Promise<T> {
  if (!env.mselfistarEnabled) {
    throw new HttpError(503, "Subscription service is disabled");
  }

  const url = `${env.mselfistarApiBase.replace(/\/$/, "")}/${endpoint}`;
  try {
    const { data } = await axios.get<T>(url, {
      params: { msisdn },
      timeout: 15000,
      validateStatus: (status) => status < 500,
    });
    return data;
  } catch (error) {
    console.error(`mselfistar ${endpoint} failed:`, error);
    throw new HttpError(503, "Unable to verify subscription. Please try again later.");
  }
}

export type CheckStatusResult =
  | { subscribed: true; status: 1 }
  | { subscribed: false; status: 0; redirectUrl?: string };

export async function checkSubscriptionStatus(phone: string): Promise<CheckStatusResult> {
  if (!env.mselfistarEnabled) {
    return { subscribed: true, status: 1 };
  }

  const msisdn = toMsisdn(phone);
  if (!msisdn) {
    throw new HttpError(400, "Invalid mobile number");
  }

  const data = await callMselfistar<Record<string, unknown>>("checkstatus", msisdn);

  if (isActiveStatus(data.status)) {
    return { subscribed: true, status: 1 };
  }

  return {
    subscribed: false,
    status: 0,
    redirectUrl: parseRedirectUrl(data),
  };
}

export interface MyAccountDetails {
  msisdn: string;
  valid_from?: string;
  valid_to?: string;
  status: 0 | 1;
  service_name?: string;
  pricePoint?: string;
  redirectUrl?: string;
}

export async function getMyAccount(phone: string): Promise<MyAccountDetails> {
  const msisdn = toMsisdn(phone);
  if (!msisdn) {
    throw new HttpError(400, "No mobile number on account");
  }

  if (!env.mselfistarEnabled) {
    return {
      msisdn,
      status: 1,
      valid_from: new Date().toISOString().slice(0, 10),
      valid_to: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      service_name: "SelfiStar",
      pricePoint: "N/A",
    };
  }

  const data = await callMselfistar<Record<string, unknown>>("myaccount", msisdn);
  const active = isActiveStatus(data.status);

  return {
    msisdn: String(data.msisdn ?? msisdn),
    valid_from: data.valid_from ? String(data.valid_from) : undefined,
    valid_to: data.valid_to ? String(data.valid_to) : undefined,
    status: active ? 1 : 0,
    service_name: data.service_name ? String(data.service_name) : undefined,
    pricePoint: data.pricePoint ? String(data.pricePoint) : undefined,
    redirectUrl: active ? undefined : parseRedirectUrl(data),
  };
}

export type DeactivateResult =
  | { success: true; status: 1; redirectUrl?: string }
  | { success: false; status: 0 };

export async function deactivateSubscription(phone: string): Promise<DeactivateResult> {
  const msisdn = toMsisdn(phone);
  if (!msisdn) {
    throw new HttpError(400, "No mobile number on account");
  }

  if (!env.mselfistarEnabled) {
    return { success: true, status: 1 };
  }

  const data = await callMselfistar<Record<string, unknown>>("unsub", msisdn);

  if (isActiveStatus(data.status)) {
    return {
      success: true,
      status: 1,
      redirectUrl: parseRedirectUrl(data),
    };
  }

  return { success: false, status: 0 };
}
