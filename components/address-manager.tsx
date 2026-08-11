"use client";
import { useEffect, useState } from "react";
import { Check, Home, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";

type Address={id:string;label:string;name:string;phone:string;line1:string;city:string;state:string;pin:string;isDefault:boolean};
type Form=Omit<Address,"id">;
const blank:Form={label:"HOME",name:"",phone:"",line1:"",city:"",state:"",pin:"",isDefault:false};

export function AddressManager({initial}:{initial:Address[]}){
 const [rows,setRows]=useState(initial),[editing,setEditing]=useState<Address|"new"|null>(null),[form,setForm]=useState<Form>(blank),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{if(!editing)return;const close=(e:KeyboardEvent)=>e.key==="Escape"&&setEditing(null);document.body.style.overflow="hidden";addEventListener("keydown",close);return()=>{document.body.style.overflow="";removeEventListener("keydown",close)}},[editing]);
 function open(a?:Address){setEditing(a??"new");setForm(a?{label:a.label,name:a.name,phone:a.phone,line1:a.line1,city:a.city,state:a.state,pin:a.pin,isDefault:a.isDefault}:blank);setError("")}
 function update<K extends keyof Form>(key:K,value:Form[K]){setForm(x=>({...x,[key]:value}))}
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");const current=editing!=="new"?editing:null;const r=await fetch(current?`/api/addresses/${current.id}`:"/api/addresses",{method:current?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const b=await r.json().catch(()=>({}));setBusy(false);if(!r.ok)return setError(b.error??"Could not save address.");const next=b.address as Address;setRows(x=>[next,...x.filter(i=>i.id!==next.id)].map(i=>next.isDefault&&i.id!==next.id?{...i,isDefault:false}:i));setEditing(null)}
 async function remove(id:string){if(!confirm("Delete this address?"))return;const r=await fetch(`/api/addresses/${id}`,{method:"DELETE"});if(r.ok)setRows(x=>x.filter(i=>i.id!==id))}
 return <section className="address-manager">
  {rows.length?<div className="address-grid">{rows.map(a=><article className={`address-card ${a.isDefault?"is-default":""}`} key={a.id}>
   <header><span className="address-icon">{a.label.toUpperCase()==="HOME"?<Home/>:<MapPin/>}</span><div><span className="address-label">{a.label}</span>{a.isDefault&&<span className="address-default"><Check/> Default</span>}</div></header>
   <div className="address-body"><b>{a.name}</b><p>{a.line1}<br/>{a.city}, {a.state} – {a.pin}</p><a href={`tel:${a.phone}`}>+91 {a.phone}</a></div>
   <footer><button onClick={()=>open(a)}><Pencil/> Edit</button><button onClick={()=>remove(a.id)} className="danger"><Trash2/> Delete</button></footer>
  </article>)}</div>:<div className="address-empty"><span><MapPin/></span><h2>No saved addresses</h2><p>Add an address for a faster checkout experience.</p></div>}
  <button onClick={()=>open()} className="btn btn-dark address-add"><Plus/> Add new address</button>
  {editing&&<div className="address-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setEditing(null)}><form onSubmit={save} className="address-modal" role="dialog" aria-modal="true" aria-labelledby="address-dialog-title">
   <header><div><span className="eyebrow">Delivery details</span><h2 id="address-dialog-title">{editing==="new"?"Add new address":"Edit address"}</h2></div><button type="button" onClick={()=>setEditing(null)} aria-label="Close address form"><X/></button></header>
   <div className="address-form">{error&&<p className="address-error">{error}</p>}
    <label><span className="label">Address label</span><input required className="field" placeholder="Home, Office…" value={form.label} onChange={e=>update("label",e.target.value)}/></label>
    <label><span className="label">Full name</span><input required autoFocus className="field" autoComplete="name" value={form.name} onChange={e=>update("name",e.target.value)}/></label>
    <label><span className="label">Mobile number</span><div className="phone-field"><span>+91</span><input required className="field" inputMode="numeric" autoComplete="tel" placeholder="10-digit number" value={form.phone} onChange={e=>update("phone",e.target.value.replace(/\D/g,"").slice(0,10))}/></div></label>
    <label className="wide"><span className="label">Street address</span><textarea required className="field" autoComplete="street-address" rows={3} value={form.line1} onChange={e=>update("line1",e.target.value)}/></label>
    <label><span className="label">City</span><input required className="field" autoComplete="address-level2" value={form.city} onChange={e=>update("city",e.target.value)}/></label>
    <label><span className="label">State</span><input required className="field" autoComplete="address-level1" value={form.state} onChange={e=>update("state",e.target.value)}/></label>
    <label><span className="label">PIN code</span><input required className="field" inputMode="numeric" autoComplete="postal-code" value={form.pin} onChange={e=>update("pin",e.target.value.replace(/\D/g,"").slice(0,6))}/></label>
    <label className="address-check"><input type="checkbox" checked={form.isDefault} onChange={e=>update("isDefault",e.target.checked)}/><span><b>Use as default address</b><small>We’ll select this address at checkout.</small></span></label>
   </div><footer><button type="button" className="btn btn-outline" onClick={()=>setEditing(null)}>Cancel</button><button disabled={busy} className="btn btn-yellow">{busy?"Saving...":"Save address"}</button></footer>
  </form></div>}
 </section>
}
