"use client";

import { useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  UsersRound,
  Zap,
} from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import "../admin.css";
import { Checkbox } from "@/components/ui/radix";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setBusy(false);
      setError("The email or password you entered is incorrect.");
      return;
    }
    const check = await fetch("/api/admin/me");
    if (!check.ok) {
      await signOut({ redirect: false });
      setBusy(false);
      setError(
        "Access denied. This account is not an authorized administrator.",
      );
      return;
    }
    router.replace("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="admin-gate">
      <section className="admin-gate-showcase">
        <div className="admin-gate-brand">
          <span>
            <Zap size={21} fill="currentColor" />
          </span>
          <div>
            <b>ELECTZO</b>
            <small>ADMINISTRATION</small>
          </div>
        </div>

        <div className="admin-gate-message">
          <div className="admin-gate-pill">
            <ShieldCheck /> Restricted staff portal
          </div>
          <h1>
            Your store.
            <br />
            <em>Under control.</em>
          </h1>
          <p>
            One secure workspace to operate Electzo products, inventory,
            customers, orders and store performance.
          </p>
          <div className="admin-gate-features">
            <span>
              <PackageCheck />
              <b>
                Catalogue & inventory<small>Manage products and stock</small>
              </b>
            </span>
            <span>
              <UsersRound />
              <b>
                Customers & orders<small>Run daily operations</small>
              </b>
            </span>
            <span>
              <BarChart3 />
              <b>
                Commerce analytics<small>Track store performance</small>
              </b>
            </span>
          </div>
        </div>

        <footer>
          <LockKeyhole /> Authorized Electzo personnel only <i /> Secure admin
          environment
        </footer>
      </section>

      <section className="admin-gate-form-side">
        <form className="admin-gate-card" onSubmit={submit}>
          <div className="admin-gate-mobile-brand">
            <Zap fill="currentColor" /> ELECTZO <span>ADMIN</span>
          </div>
          <div className="admin-gate-icon">
            <KeyRound />
          </div>
          <span className="admin-gate-overline">ADMIN CONSOLE</span>
          <h2>Administrator sign in</h2>
          <p>
            Enter your authorized credentials to continue to the management
            dashboard.
          </p>

          {error && (
            <div className="admin-gate-error" role="alert">
              <ShieldCheck />
              {error}
            </div>
          )}

          <label className="admin-gate-field">
            <b>Admin email</b>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@electzo.com"
            />
          </label>
          <label className="admin-gate-field">
            <span>
              <b>Password</b>
              <button type="button">Forgot password?</button>
            </span>
            <div>
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
          <label className="admin-gate-remember">
            <Checkbox /> Keep me signed in on this device
          </label>
          <button className="admin-gate-submit" disabled={busy}>
            {busy ? <span className="adm-spinner" /> : <LockKeyhole />}
            {busy ? "Verifying access..." : "Access admin console"}
          </button>
          <div className="admin-gate-trust">
            <CheckCircle2 /> Role and permissions will be verified before
            access.
          </div>
        </form>
        <footer className="admin-gate-form-footer">
          Electzo Merchant Systems <span>•</span> Admin Portal v1.0
        </footer>
      </section>
    </main>
  );
}
