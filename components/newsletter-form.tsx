"use client";
import { useState } from "react";
import { useStore } from "@/stores/use-store";
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return useStore.getState().notify("Please enter a valid email address");
    useStore.getState().notify("Subscribed — welcome to Electzo updates!"); setEmail("");
  };
  return <form onSubmit={submit} className="mx-auto mt-5 flex max-w-md"><input value={email} onChange={(e) => setEmail(e.target.value)} className="field rounded-r-none" placeholder="Your email address" aria-label="Email address"/><button className="btn btn-dark rounded-l-none">Subscribe</button></form>;
}
