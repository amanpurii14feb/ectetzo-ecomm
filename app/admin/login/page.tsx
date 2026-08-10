"use client";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, Zap } from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import "../admin.css";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) { setBusy(false); setError("Email or password is incorrect."); return; }
    const check = await fetch("/api/admin/me");
    if (!check.ok) { await signOut({ redirect: false }); setBusy(false); setError("This account does not have admin access."); return; }
    router.replace("/admin/dashboard"); router.refresh();
  }
  return <main className="adm-login"><section className="adm-login-visual"><div className="adm-login-brand"><span><Zap size={21} fill="currentColor"/></span><b>Electzo <small>ADMIN</small></b></div><div className="adm-login-copy"><div className="adm-orbit"><ShoppingGlyph/></div><h1>Run your entire commerce operation from one place.</h1><p>Products, orders, customers and store performance—securely managed in one focused workspace.</p></div><div className="adm-security"><ShieldCheck size={16}/> Protected administrative access</div></section><section className="adm-login-form-wrap"><form className="adm-login-card" onSubmit={submit}><div className="adm-mobile-brand"><Zap size={20}/> Electzo Admin</div><span className="adm-kicker">MERCHANT CONTROL CENTRE</span><h2>Welcome back</h2><p>Sign in to manage your Electzo store.</p>{error && <div className="adm-form-alert">{error}</div>}<label><b>Email address</b><input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@electzo.com"/></label><label><div className="adm-label-row"><b>Password</b><button type="button">Forgot password?</button></div><div className="adm-password"><input type={show?"text":"password"} autoComplete="current-password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?"Hide password":"Show password"}>{show?<EyeOff/>:<Eye/>}</button></div></label><label className="adm-remember"><input type="checkbox"/> Remember me on this device</label><button className="adm-primary" disabled={busy}>{busy?<span className="adm-spinner"/>:<LockKeyhole size={16}/>} {busy?"Signing in...":"Sign in to admin"}</button><small className="adm-login-note"><ShieldCheck size={14}/> Your session is encrypted and monitored for security.</small></form></section></main>;
}
function ShoppingGlyph(){return <div className="adm-glyph"><span>₹</span><i/><i/><i/></div>}
