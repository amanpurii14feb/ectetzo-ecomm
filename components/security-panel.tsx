"use client";

import { Bell, EyeOff, LockKeyhole, Mail, MessageSquare, UserRound } from "lucide-react";
import { useState } from "react";

export function SecurityPanel() {
  const [prefs, setPrefs] = useState({ email: true, sms: false, marketing: true });
  return <div className="security-grid">
    <form className="security-card card" onSubmit={e=>e.preventDefault()}>
      <h2><LockKeyhole/> Change password</h2>
      {["Current password","New password","Confirm new password"].map(label=><label className="security-input" key={label}><input type="password" placeholder={label}/><EyeOff/></label>)}
      <button className="btn btn-yellow">Update password</button>
    </form>
    <div className="security-side">
      <section className="security-card card"><h2><UserRound/> Account preferences</h2>
        {([['email','Email notifications','Receive order updates and offers',Mail],['sms','SMS notifications','Receive SMS for order updates',MessageSquare],['marketing','Marketing emails','Receive emails about new products',Bell]] as const).map(([key,title,desc,Icon])=><div className="preference-row" key={key}><span><Icon/></span><div><b>{title}</b><small>{desc}</small></div><button type="button" className={`preference-switch ${prefs[key]?'on':''}`} onClick={()=>setPrefs(p=>({...p,[key]:!p[key]}))}><i/></button></div>)}
      </section>
      <button className="delete-account card"><span><b>Delete account</b><small>Permanently delete your account and data</small></span><span>›</span></button>
    </div>
  </div>;
}
