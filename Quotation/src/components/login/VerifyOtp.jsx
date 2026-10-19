import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { MailCheck, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../utils/apiFetch";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const challengeId = sessionStorage.getItem("otpChallengeId");
  const maskedDestination = sessionStorage.getItem("otpMaskedDestination")
    || "your registered email address";
  const initialExpiresIn = Number(sessionStorage.getItem("otpExpiresInSeconds"));
  const initialResendIn = Number(sessionStorage.getItem("otpResendAfterSeconds"));
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [expiresIn, setExpiresIn] = useState(
    Number.isFinite(initialExpiresIn) && initialExpiresIn > 0 ? initialExpiresIn : 300
  );
  const [resendIn, setResendIn] = useState(
    Number.isFinite(initialResendIn) && initialResendIn >= 0 ? initialResendIn : 30
  );
  const [challengeLocked, setChallengeLocked] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExpiresIn((remaining) => Math.max(remaining - 1, 0));
      setResendIn((remaining) => Math.max(remaining - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!challengeId) {
    return <Navigate to="/login" replace />;
  }

  const handleVerify = async (event) => {
    event.preventDefault();
    if (otp.length !== 6 || isVerifying || challengeLocked || expiresIn === 0) return;

    setIsVerifying(true);
    setError("");
    try {
      const response = await apiFetch(
        "/api/employee/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId, otp })
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.token) {
        if (response.status === 423 || response.status === 410 || response.status === 409) {
          setChallengeLocked(true);
        }
        const messageByStatus = {
          400: "That code is incorrect. Check the email and try again.",
          409: "This challenge is no longer active. Sign in again to request a new code.",
          410: "This code has expired. Sign in again to request a new code.",
          423: "This challenge is locked after too many attempts. Sign in again.",
          429: "Too many attempts. Please wait before trying again.",
          503: "The verification service is temporarily unavailable. Please try again later."
        };
        throw new Error(messageByStatus[response.status]
          || "Unable to verify the code. Check your connection and try again.");
      }

      localStorage.setItem("token", data.token);
      const employeeId = sessionStorage.getItem("pendingEmployeeId");
      if (employeeId) localStorage.setItem("empId", employeeId);
      sessionStorage.removeItem("otpChallengeId");
      sessionStorage.removeItem("pendingEmployeeId");
      sessionStorage.removeItem("otpMaskedDestination");
      sessionStorage.removeItem("otpExpiresInSeconds");
      sessionStorage.removeItem("otpResendAfterSeconds");
      setSuccess(true);
      window.setTimeout(() => navigate("/employee", { replace: true }), 900);
    } catch (verificationError) {
      setError(verificationError.message || "Unable to verify the code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending || resendIn > 0 || challengeLocked) return;
    setIsResending(true);
    setError("");
    try {
      const response = await apiFetch(
        "/api/employee/auth/resend-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId })
        }
      );
      await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 423 || response.status === 410 || response.status === 409) {
          setChallengeLocked(true);
        }
        const messageByStatus = {
          409: "This challenge is no longer active. Sign in again to request a new code.",
          410: "This challenge has expired. Sign in again to request a new code.",
          423: "This challenge is locked. Sign in again to continue.",
          429: "Please wait before requesting another code.",
          503: "Email delivery is temporarily unavailable. Please try again later."
        };
        throw new Error(messageByStatus[response.status]
          || "Unable to send another code right now.");
      }
      setOtp("");
      setExpiresIn(300);
      setResendIn(30);
    } catch (resendError) {
      setError(resendError.message || "Unable to resend the code. Check your connection and retry.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-indigo-100/60 sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          {success ? <ShieldCheck size={32} /> : <MailCheck size={32} />}
        </div>
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
          Two-step verification
        </p>
        <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          {success ? "Verification complete" : "Check your email"}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-slate-500">
          {success
            ? "Your account is verified. Taking you to your dashboard..."
            : `We sent a 6-digit sign-in code to ${maskedDestination}.`}
        </p>

        {!success && (
          <form onSubmit={handleVerify} className="mt-8">
            <label htmlFor="otp-code" className="mb-2 block text-sm font-semibold text-slate-700">
              Verification code
            </label>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              placeholder="000000"
              aria-describedby={error ? "otp-error" : "otp-expiry"}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-bold tracking-[0.45em] text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              disabled={success || challengeLocked || expiresIn === 0}
            />
            <p id="otp-expiry" className="mt-2 text-right text-xs text-slate-500">
              {expiresIn > 0 ? `Code expires in ${formatTime(expiresIn)}` : "This code has expired."}
            </p>

            {error && (
              <p id="otp-error" role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={otp.length !== 6 || isVerifying || challengeLocked || expiresIn === 0}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isVerifying ? "Verifying..." : "Verify and continue"}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-6 text-center text-sm text-slate-500">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || resendIn > 0 || challengeLocked}
              className="font-semibold text-indigo-600 hover:text-indigo-800 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {isResending ? "Sending..." : resendIn > 0 ? `Resend in ${formatTime(resendIn)}` : "Resend code"}
            </button>
          </div>
        )}

        {!success && (
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("otpChallengeId");
              sessionStorage.removeItem("pendingEmployeeId");
              sessionStorage.removeItem("otpMaskedDestination");
              sessionStorage.removeItem("otpExpiresInSeconds");
              sessionStorage.removeItem("otpResendAfterSeconds");
              navigate("/login", { replace: true });
            }}
            className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Return to sign in
          </button>
        )}
      </section>
    </main>
  );
};

export default VerifyOtp;
