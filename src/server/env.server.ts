/**
 * Server-only environment access.
 *
 * Cloudflare Workers expose vars/secrets on the per-request `env` binding
 * (Nitro mirrors it to `globalThis.__env__`) and, with `nodejs_compat`, on
 * `process.env`. Node-based hosts (local dev, Vercel, Netlify) use
 * `process.env`. Never import this file from browser code.
 */

type EnvRecord = Record<string, unknown>;

function readRaw(name: string): string | undefined {
  const cf = (globalThis as { __env__?: EnvRecord }).__env__;
  const fromBinding = cf?.[name];
  if (typeof fromBinding === "string" && fromBinding.length > 0) return fromBinding;
  if (typeof process !== "undefined" && process.env) {
    const fromProcess = process.env[name];
    if (typeof fromProcess === "string" && fromProcess.length > 0) return fromProcess;
  }
  return undefined;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function requireEnv(name: string) {
  const value = readRaw(name)?.trim();
  if (!value) throw new ConfigError(`Missing server environment variable ${name}`);
  return value;
}

export function optionalEnv(name: string) {
  return readRaw(name)?.trim() || undefined;
}

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  /** "test" for rzp_test_ keys, "live" for rzp_live_ keys. */
  environment: "test" | "live";
}

export function getRazorpayConfig(): RazorpayConfig {
  const keyId = requireEnv("RAZORPAY_KEY_ID");
  const keySecret = requireEnv("RAZORPAY_KEY_SECRET");
  if (!/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId)) {
    throw new ConfigError("RAZORPAY_KEY_ID must start with rzp_test_ or rzp_live_");
  }
  return { keyId, keySecret, environment: keyId.startsWith("rzp_live_") ? "live" : "test" };
}

export function getWebhookSecret() {
  return requireEnv("RAZORPAY_WEBHOOK_SECRET");
}

export interface SheetConfig {
  url: string;
  secret: string;
}

/** Returns undefined when the Google Sheet sync is not configured yet. */
export function getSheetConfig(): SheetConfig | undefined {
  const url = optionalEnv("GOOGLE_SCRIPT_URL");
  const secret = optionalEnv("GOOGLE_SCRIPT_SECRET");
  if (!url || !secret) return undefined;
  if (!url.startsWith("https://script.google.com/")) {
    throw new ConfigError("GOOGLE_SCRIPT_URL must be a https://script.google.com/ web app URL");
  }
  return { url, secret };
}
