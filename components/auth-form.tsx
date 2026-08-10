"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function AuthForm({ registering = false, callbackUrl = "/account" }: { registering?: boolean; callbackUrl?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function submit(values: FormValues) {
    setServerError("");
    if (registering) {
      if (!values.name || values.name.trim().length < 2) {
        setServerError("Please enter your full name.");
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
    const result = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
    if (result?.error) {
      setServerError("Email or password is incorrect.");
      return;
    }
    router.push(callbackUrl.startsWith("/") ? callbackUrl : "/account");
    router.refresh();
  }

  return (
    <div className="container section">
      <form onSubmit={handleSubmit(submit)} className="card mx-auto max-w-md p-7">
        <div className="eyebrow">Welcome to Electzo</div>
        <h1 className="mt-2 text-3xl font-black">{registering ? "Create account" : "Sign in"}</h1>
        <p className="mt-2 text-sm muted">{registering ? "Manage orders, addresses and saved items." : "Access orders and faster checkout."}</p>
        {registering && <label className="mt-6 block"><span className="label">Full name</span><input className="field" {...register("name")} /></label>}
        <label className="mt-4 block"><span className="label">Email</span><input type="email" className="field" {...register("email")} /><small className="text-red-600">{errors.email?.message}</small></label>
        <label className="mt-4 block"><span className="label">Password</span><input type="password" className="field" {...register("password")} /><small className="text-red-600">{errors.password?.message}</small></label>
        {serverError && <p className="mt-3 text-sm text-red-600">{serverError}</p>}
        <button disabled={isSubmitting} className="btn btn-yellow mt-5 w-full">{isSubmitting ? "Please wait..." : registering ? "Create account" : "Sign in"}</button>
        <button type="button" onClick={() => signIn("google", { callbackUrl: callbackUrl.startsWith("/") ? callbackUrl : "/account" })} className="btn btn-outline mt-3 w-full">Continue with Google</button>
        <p className="mt-5 text-center text-sm muted">{registering ? "Already registered? " : "New to Electzo? "}<Link className="font-bold text-ink" href={registering ? "/login" : "/register"}>{registering ? "Sign in" : "Create account"}</Link></p>
      </form>
    </div>
  );
}
