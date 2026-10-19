import assert from "node:assert/strict";
import test from "node:test";
import { classifyLoginResponse } from "./loginResponse.js";

test("accepts a successful employee OTP challenge", () => {
  assert.deepEqual(
    classifyLoginResponse({
      isAdmin: false,
      ok: true,
      status: 200,
      data: {
        challengeId: "challenge-1",
        message: "Code sent",
        maskedDestination: "e***e@example.test",
        expiresInSeconds: 240,
        resendAfterSeconds: 45
      }
    }),
    {
      type: "otp-challenge",
      challengeId: "challenge-1",
      maskedDestination: "e***e@example.test",
      expiresInSeconds: 240,
      resendAfterSeconds: 45
    }
  );
});

test("does not treat a token-only employee response as an OTP success", () => {
  assert.deepEqual(
    classifyLoginResponse({
      isAdmin: false,
      ok: true,
      status: 200,
      data: { token: "legacy-token" }
    }),
    {
      type: "error",
      message: "The sign-in service returned an unexpected response. Please contact support."
    }
  );
});

test("rejects an application-level failure returned with HTTP 200", () => {
  const outcome = classifyLoginResponse({
    isAdmin: false,
    ok: true,
    status: 200,
    data: { success: false, message: "internal backend detail" }
  });

  assert.equal(outcome.type, "error");
  assert.match(outcome.message, /Employee sign-in was not accepted/);
  assert.doesNotMatch(outcome.message, /internal backend detail/);
});

test("handles malformed or missing response fields without claiming success", () => {
  for (const data of [null, {}, { challengeId: "" }, { challengeId: 42 }]) {
    assert.equal(
      classifyLoginResponse({ isAdmin: false, ok: true, status: 200, data }).type,
      "error"
    );
  }
});

test("maps invalid credentials and inactive accounts separately", () => {
  assert.equal(
    classifyLoginResponse({ isAdmin: false, ok: false, status: 401 }).message,
    "Invalid employee ID or password."
  );
  assert.equal(
    classifyLoginResponse({ isAdmin: false, ok: false, status: 403 }).message,
    "This employee account is inactive. Contact your administrator."
  );
});

test("preserves admin login token handling", () => {
  assert.deepEqual(
    classifyLoginResponse({
      isAdmin: true,
      ok: true,
      status: 200,
      data: { token: "admin-token" }
    }),
    { type: "admin-authenticated", token: "admin-token" }
  );
});
