"use client";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/stores/use-store";

export function AccountProducts({ products, title="Recommended for you" }: {products:Product[];title?:string}) {
 const add=useStore(s=>s.add),toggle=useStore(s=>s.toggleWish),wishes=useStore(s=>s.wishlist);
 return <section className="account-products"><header><div><h2>{title}</h2><p>Handpicked electrical essentials for your next project.</p></div><Link href="/shop">View all →</Link></header><div className="account-product-grid">{products.map(p=><article key={p.id}><div className="account-product-image" style={{background:p.color}}>{p.images?.[0]&&<img src={p.images[0]} alt=""/>}<button onClick={()=>toggle(p.id)} aria-label="Toggle wishlist"><Heart fill={wishes.includes(p.id)?"#ef2b2b":"none"}/></button></div><Link href={`/product/${p.slug}`}><small>{p.brand}</small><b>{p.name}</b></Link><span className="account-rating"><Star fill="#f6b800"/> {p.rating} <i>({p.reviews})</i></span><div className="account-price"><strong>₹{p.price.toLocaleString("en-IN")}</strong><s>₹{p.mrp.toLocaleString("en-IN")}</s><em>{Math.round((1-p.price/p.mrp)*100)}% off</em></div><button className="btn btn-yellow" onClick={()=>add(p.id)}><ShoppingCart/> Add to cart</button></article>)}</div></section>
}
