"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Box,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Mail,
  PackageSearch,
  ShieldCheck,
  Truck,
  UserRound,
  Zap,
} from "lucide-react";

const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(6, "Use at least 6 characters").max(100),
  name: z.string().trim().min(2).max(80).optional(),
});
type FormValues = z.infer<typeof schema>;

export function AuthForm({
  registering = false,
  callbackUrl = "/account",
}: {
  registering?: boolean;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function submit(values: FormValues) {
    setServerError("");
    if (registering) {
      if (!values.name || values.name.trim().length < 2) {
        setServerError("Please enter your full name.");
        return;
      }
      if (
        values.password.length < 8 ||
        !/[a-z]/.test(values.password) ||
        !/[A-Z]/.test(values.password) ||
        !/\d/.test(values.password)
      ) {
        setServerError(
          "Use 8+ characters with uppercase, lowercase and a number.",
        );
        return;
      }
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json();
      if (!response.ok) {
        setServerError(body.error ?? "Account could not be created.");
        return;
      }
    }
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (result?.error) {
      setServerError("Email or password is incorrect.");
      return;
    }
    setTransitioning(true);
    router.push(callbackUrl.startsWith("/") ? callbackUrl : "/account");
    router.refresh();
  }

  const busy = isSubmitting || transitioning;

  return (
    <div className="relative overflow-hidden bg-[#f7f6f2] py-8 md:py-12 lg:py-16">
      {transitioning && <AuthTransition destination={callbackUrl} />}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-volt/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-volt/10 blur-3xl" />
      <div className="container relative max-w-[1240px]">
        <div className="grid overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(20,20,20,.12)] lg:grid-cols-[1.05fr_.95fr]">
          <section className="relative overflow-hidden bg-ink p-7 text-white md:p-10 lg:p-14">
            <div className="pointer-events-none absolute inset-0 opacity-[.08] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:38px_38px]" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[42px] border-volt/20" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-volt">
                <Zap size={15} fill="currentColor" /> ELECTZO CUSTOMER ACCESS
              </span>
              <h2 className="mt-7 max-w-xl text-3xl font-black leading-tight tracking-[-.03em] md:text-4xl lg:text-5xl">
                Powering your electrical purchases,{" "}
                <span className="text-volt">faster.</span>
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-white/65">
                Sign in to manage orders, access business pricing, save products
                and enjoy a faster checkout experience.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  [ShieldCheck, "Fast & secure checkout"],
                  [FileText, "GST invoices available"],
                  [Box, "Bulk & business pricing"],
                  [PackageSearch, "Easy order tracking"],
                ].map(([Icon, label]) => {
                  const I = Icon as typeof ShieldCheck;
                  return (
                    <div
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.06] p-3 text-sm font-bold"
                      key={String(label)}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-volt text-ink">
                        <I size={18} />
                      </span>
                      {String(label)}
                    </div>
                  );
                })}
              </div>
              <div className="mt-9 flex items-center gap-4 border-t border-white/10 pt-6">
                <div className="flex -space-x-2">
                  {["H", "L", "S", "A"].map((x) => (
                    <span
                      key={x}
                      className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-white text-xs font-black text-ink"
                    >
                      {x}
                    </span>
                  ))}
                </div>
                <p className="text-sm">
                  <b className="block text-white">
                    10,000+ electrical products
                  </b>
                  <span className="text-white/50">from trusted brands</span>
                </p>
              </div>
              <div
                className="mt-8 hidden items-end gap-3 lg:flex"
                aria-hidden="true"
              >
                <span className="grid h-28 w-24 place-items-center rounded-2xl bg-white/5 text-volt">
                  <Zap size={44} />
                </span>
                <span className="grid h-20 w-28 place-items-center rounded-2xl bg-volt text-ink">
                  <Truck size={36} />
                </span>
                <span className="grid h-24 w-24 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white">
                  <LockKeyhole size={36} />
                </span>
              </div>
            </div>
          </section>
          <section className="flex items-center bg-gradient-to-br from-white to-[#fffdf5] p-5 sm:p-8 lg:p-10">
            <form
              onSubmit={handleSubmit(submit)}
              className="mx-auto w-full max-w-[470px] rounded-[20px] border border-black/10 bg-white p-6 shadow-[0_12px_40px_rgba(20,20,20,.08)] sm:p-9"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-volt text-ink">
                <Zap fill="currentColor" size={23} />
              </span>
              <div className="eyebrow mt-6">
                {registering ? "Join Electzo" : "Welcome back"}
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight">
                {registering
                  ? "Create your account"
                  : "Sign in to your account"}
              </h1>
              <p className="mt-2 text-sm leading-6 muted">
                {registering
                  ? "Manage orders, saved items and business purchases."
                  : "Access your orders, saved items and faster checkout."}
              </p>
              {registering && (
                <AuthField
                  label="Full name"
                  error={errors.name?.message}
                  icon={<UserRound size={18} />}
                >
                  <input
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    placeholder="Your full name"
                    {...register("name")}
                  />
                </AuthField>
              )}
              <AuthField
                label="Email address"
                error={errors.email?.message}
                icon={<Mail size={18} />}
                first={!registering}
              >
                <input
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </AuthField>
              <AuthField
                label="Password"
                error={errors.password?.message}
                icon={<LockKeyhole size={18} />}
                action={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="text-gray-500 hover:text-ink"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              >
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    registering ? "new-password" : "current-password"
                  }
                  minLength={registering ? 8 : 6}
                  maxLength={100}
                  placeholder="Enter your password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
              </AuthField>
              {!registering && (
                <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <input type="checkbox" className="accent-yellow-500" />{" "}
                  Remember me on this device
                </label>
              )}
              {serverError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 shrink-0" size={17} />
                  {serverError}
                </div>
              )}
              <button
                disabled={busy}
                className="btn btn-yellow mt-6 h-12 w-full rounded-xl shadow-[0_8px_20px_rgba(246,184,0,.22)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(246,184,0,.3)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    {transitioning
                      ? "Opening your account..."
                      : registering
                        ? "Creating account..."
                        : "Signing in..."}
                  </>
                ) : registering ? (
                  "Create account"
                ) : (
                  "Sign in"
                )}
              </button>
              <div className="my-5 flex items-center gap-3 text-[10px] font-bold tracking-widest text-gray-400">
                <i className="h-px flex-1 bg-gray-200" />
                OR CONTINUE WITH
                <i className="h-px flex-1 bg-gray-200" />
              </div>
              <button
                disabled={busy}
                type="button"
                onClick={() => {
                  setTransitioning(true);
                  void signIn("google", {
                    callbackUrl: callbackUrl.startsWith("/")
                      ? callbackUrl
                      : "/account",
                  });
                }}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white font-bold transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-60"
              >
                <GoogleMark />
                Continue with Google
              </button>
              <p className="mt-6 text-center text-sm muted">
                {registering ? "Already registered? " : "New to Electzo? "}
                <Link
                  className="font-black text-amber-600 hover:underline"
                  href={registering ? "/login" : "/register"}
                >
                  {registering ? "Sign in" : "Create an account"}
                </Link>
              </p>
              {!registering && (
                <Link
                  href="/shop"
                  className="mt-3 block text-center text-xs font-bold text-gray-500 hover:text-ink"
                >
                  Continue shopping without signing in →
                </Link>
              )}
              <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-2 border-t pt-5 text-[10px] font-bold text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} /> Secure Login
                </span>
                <span>•</span>
                <span>SSL Protected</span>
                <span>•</span>
                <span>Privacy Protected</span>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

function AuthField({
  label,
  error,
  icon,
  action,
  first = false,
  children,
}: {
  label: string;
  error?: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  first?: boolean;
  children: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>;
}) {
  return (
    <label className={`block ${first ? "mt-6" : "mt-4"}`}>
      <span className="label">{label}</span>
      <span
        className={`flex h-12 items-center gap-3 rounded-xl border bg-white px-3 transition focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200 ${error ? "border-red-500" : "border-gray-300"}`}
      >
        <i className="text-gray-400">{icon}</i>
        {
          <span className="min-w-0 flex-1 [&>input]:h-10 [&>input]:w-full [&>input]:border-0 [&>input]:bg-transparent [&>input]:outline-none">
            {children}
          </span>
        }
        {action}
      </span>
      {error && (
        <small role="alert" className="mt-1 block text-red-600">
          {error}
        </small>
      )}
    </label>
  );
}
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.7-2.4L15.4 17c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.7A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.4H3A10 10 0 0 0 3 16.6l3.4-2.7Z"
      />
      <path
        fill="#EA4335"
        d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3 7.4l3.4 2.7C7.2 7.8 9.4 6 12 6Z"
      />
    </svg>
  );
}

function AuthTransition({ destination }: { destination: string }) {
  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-white/95 px-5 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-volt text-ink shadow-lg">
          <LockKeyhole size={30} />
        </span>
        <h2 className="mt-6 text-2xl font-black">Login successful</h2>
        <p className="mt-2 text-sm muted">
          Loading your secure{" "}
          {destination.startsWith("/checkout") ? "checkout" : "account"}…
        </p>
        <div className="mt-7 overflow-hidden rounded-full bg-gray-200">
          <div className="h-1.5 w-2/3 animate-pulse rounded-full bg-volt" />
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3" aria-hidden="true">
          <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
