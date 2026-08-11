"use client";
import { useState } from "react";
import { useStore } from "@/stores/use-store";
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return useStore.getState().notify("Please enter a valid email address");
    const r=await fetch("/api/newsletter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
    const b=await r.json().catch(()=>({}));
    useStore.getState().notify(r.ok?"Subscribed — welcome to Electzo updates!":b.error??"Could not subscribe"); if(r.ok)setEmail("");
  };
  return <form onSubmit={submit} className="mx-auto mt-5 flex max-w-md"><input value={email} onChange={(e) => setEmail(e.target.value)} className="field rounded-r-none" placeholder="Your email address" aria-label="Email address"/><button className="btn btn-dark rounded-l-none">Subscribe</button></form>;
}
