"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { apiFetch } from "./api";

export async function performPasskeyStepUp(action) {
  const optionResult = await apiFetch("/auth/passkeys/step-up/options", {
    method: "POST",
    body: JSON.stringify({ action })
  });
  const assertion = await startAuthentication({ optionsJSON: optionResult.data.options });
  return apiFetch("/auth/passkeys/step-up/verify", {
    method: "POST",
    body: JSON.stringify({
      action,
      ceremonyToken: optionResult.data.ceremonyToken,
      response: assertion
    })
  });
}

export async function withPasskeyStepUp(operation, action) {
  try {
    return await operation();
  } catch (error) {
    if (error.status !== 403 || error.code !== "PASSKEY_STEP_UP_REQUIRED" || error.details?.action !== action) {
      throw error;
    }
  }

  await performPasskeyStepUp(action);
  return operation();
}

export function apiFetchWithPasskeyStepUp(path, options, action) {
  return withPasskeyStepUp(() => apiFetch(path, options), action);
}

export async function downloadWithPasskeyStepUp(path, filename, action) {
  const response = await withPasskeyStepUp(() => apiFetch(path, { method: "GET" }), action);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
