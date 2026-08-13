"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductGrid } from "./product-grid";

export function VirtualProductGrid({items,view,compareIds,onCompare}:{items:Product[];view:"grid"|"list";compareIds:number[];onCompare:(id:number)=>void}) {
  const parentRef=useRef<HTMLDivElement>(null);
  const [layout,setLayout]=useState({width:1200,top:0});
  useEffect(()=>{const update=()=>{const rect=parentRef.current?.getBoundingClientRect();setLayout({width:rect?.width??window.innerWidth,top:(rect?.top??0)+window.scrollY})};update();const observer=new ResizeObserver(update);if(parentRef.current)observer.observe(parentRef.current);window.addEventListener("resize",update);return()=>{observer.disconnect();window.removeEventListener("resize",update)}},[]);
  const width=layout.width;
  const columns=view==="list"?1:width<560?1:width<900?2:3;
  const rows=useMemo(()=>Array.from({length:Math.ceil(items.length/columns)},(_,index)=>items.slice(index*columns,index*columns+columns)),[items,columns]);
  const virtualizer=useWindowVirtualizer({count:rows.length,estimateSize:()=>view==="list"?286:410,overscan:2,scrollMargin:layout.top});
  return <div ref={parentRef} className="virtual-product-list" style={{height:virtualizer.getTotalSize(),position:"relative"}}>{virtualizer.getVirtualItems().map(row=><div className="virtual-product-row" key={row.key} ref={virtualizer.measureElement} data-index={row.index} style={{position:"absolute",top:0,left:0,width:"100%",transform:`translateY(${row.start-virtualizer.options.scrollMargin}px)`,paddingBottom:18}}><ProductGrid items={rows[row.index]} view={view} compareIds={compareIds} onCompare={onCompare}/></div>)}</div>;
}
