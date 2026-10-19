const hasValue = (value) => typeof value === "string" && value.trim().length > 0;

const unexpectedResponseMessage =
  "The sign-in service returned an unexpected response. Please contact support.";

const getHttpErrorMessage = (isAdmin, status) => {
  if (status === 400) {
    return "The sign-in request is invalid. Check the required fields and try again.";
  }
  if (status === 401) {
    return isAdmin
      ? "Invalid admin username or password."
      : "Invalid employee ID or password.";
  }
  if (status === 403 && !isAdmin) {
    return "This employee account is inactive. Contact your administrator.";
  }
  if (status === 429) {
    return "Too many sign-in attempts. Please wait before trying again.";
  }
  if (status >= 500) {
    return "The sign-in service is temporarily unavailable. Please try again later.";
  }
  return `The sign-in request failed (HTTP ${status}). Please contact support.`;
};

export const classifyLoginResponse = ({ isAdmin, ok, status, data }) => {
  if (!ok) {
    return {
      type: "error",
      message: getHttpErrorMessage(isAdmin, status)
    };
  }

  if (data?.success === false) {
    return {
      type: "error",
      message: isAdmin
        ? "Admin sign-in was not accepted. Check your details or contact support."
        : "Employee sign-in was not accepted. Check your details or contact support."
    };
  }

  if (isAdmin && hasValue(data?.token)) {
    return { type: "admin-authenticated", token: data.token };
  }

  if (!isAdmin && hasValue(data?.challengeId)) {
    return {
      type: "otp-challenge",
      challengeId: data.challengeId.trim(),
      maskedDestination: hasValue(data.maskedDestination)
        ? data.maskedDestination
        : "your registered email address",
      expiresInSeconds: Number.isInteger(data.expiresInSeconds) && data.expiresInSeconds > 0
        ? data.expiresInSeconds
        : 300,
      resendAfterSeconds: Number.isInteger(data.resendAfterSeconds) && data.resendAfterSeconds >= 0
        ? data.resendAfterSeconds
        : 30
    };
  }

  return { type: "error", message: unexpectedResponseMessage };
};
