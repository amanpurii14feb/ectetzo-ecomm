"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Zap,
} from "lucide-react";
import "../admin.css";
export default function AdminForgotPassword() {
  const [email, setEmail] = useState(""),
    [recoveryPassword, setRecoveryPassword] = useState(""),
    [newPassword, setNewPassword] = useState(""),
    [confirmPassword, setConfirmPassword] = useState(""),
    [showRecovery, setShowRecovery] = useState(false),
    [showNew, setShowNew] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  useEffect(() => {
    setEmail(new URLSearchParams(window.location.search).get("email") || "");
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword)
      return setError("New passwords do not match.");
    setBusy(true);
    const response = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, recoveryPassword, newPassword }),
    });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok)
      return setError(result.error || "Password could not be updated.");
    setSuccess(result.message);
    setRecoveryPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }
  return (
    <main className="admin-reset-page">
      <section className="admin-reset-brand">
        <Link href="/admin/login">
          <Zap fill="currentColor" />
          ELECTZO <span>ADMIN</span>
        </Link>
        <div>
          <ShieldCheck />
          <h1>Secure account recovery.</h1>
          <p>
            Verify your administrator recovery credential, then choose a strong
            new password for the console.
          </p>
        </div>
        <small>Authorized Electzo personnel only</small>
      </section>
      <section className="admin-reset-form-side">
        <form className="admin-gate-card admin-reset-card" onSubmit={submit}>
          <Link className="admin-reset-back" href="/admin/login">
            <ArrowLeft />
            Back to sign in
          </Link>
          <div className="admin-gate-icon">
            <KeyRound />
          </div>
          <span className="admin-gate-overline">ADMIN RECOVERY</span>
          <h2>Update password</h2>
          <p>
            Enter your admin email and configured recovery password to continue.
          </p>
          {error && (
            <div className="admin-gate-error" role="alert">
              <ShieldCheck />
              {error}
            </div>
          )}
          {success && (
            <div className="admin-gate-recovery-success" role="status">
              <CheckCircle2 />
              {success}
            </div>
          )}
          <label className="admin-gate-field">
            <b>Admin email</b>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              placeholder="admin@example.com"
            />
          </label>
          <PasswordField
            label="Recovery password"
            value={recoveryPassword}
            setValue={setRecoveryPassword}
            show={showRecovery}
            setShow={setShowRecovery}
            autoComplete="current-password"
          />
          <PasswordField
            label="New password"
            value={newPassword}
            setValue={setNewPassword}
            show={showNew}
            setShow={setShowNew}
            autoComplete="new-password"
          />
          <label className="admin-gate-field">
            <b>Confirm new password</b>
            <input
              type="password"
              required
              minLength={12}
              maxLength={100}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>
          <small className="admin-reset-hint">
            Use 12+ characters with uppercase, lowercase, number and special
            character.
          </small>
          <button className="admin-gate-submit" disabled={busy}>
            {busy ? <span className="adm-spinner" /> : <LockKeyhole />}
            {busy ? "Updating password..." : "Update password"}
          </button>
          {success && (
            <Link className="admin-reset-login" href="/admin/login">
              Continue to admin sign in →
            </Link>
          )}
        </form>
      </section>
    </main>
  );
}
function PasswordField({
  label,
  value,
  setValue,
  show,
  setShow,
  autoComplete,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  show: boolean;
  setShow: (value: boolean) => void;
  autoComplete: string;
}) {
  return (
    <label className="admin-gate-field">
      <b>{label}</b>
      <div>
        <input
          type={show ? "text" : "password"}
          required
          minLength={12}
          maxLength={100}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </label>
  );
}
