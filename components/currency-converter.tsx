"use client";
import { useMemo, useState } from "react";

type Currency = "HUF" | "EUR" | "USD" | "ISK";
export type CurrencyRates = Record<Currency, number>;
const codes: Currency[] = ["HUF", "EUR", "USD", "ISK"];
const names: Record<Currency, string> = {
 HUF:"Hungarian forint", EUR:"Euro", USD:"US dollar", ISK:"Icelandic króna",
};
export default function CurrencyConverter({ rates, rateDate }: {rates:CurrencyRates | null;rateDate:string | null}) {
 const [amount,setAmount] = useState("10");
 const [from,setFrom] = useState<Currency>("EUR");
 const [to,setTo] = useState<Currency>("HUF");
 const output = useMemo(()=>{
   if(!rates) return null;
   const n=Number(amount.replace(",","."));
   if(!Number.isFinite(n) || n<0 || n>1000000000) return null;
   return n*(rates[to]/rates[from]);
 },[rates,amount,from,to]);
 const fmt=(v:number,to:Currency)=>new Intl.NumberFormat("en-GB",{maximumFractionDigits:to==="HUF"||to==="ISK"?0:2,minimumFractionDigits:0}).format(v);
 const examples:[number,Currency,Currency][]=[
  [10,"EUR","HUF"], [10,"USD","HUF"], [10,"USD","ISK"], [10000,"ISK","HUF"],
 ];
 return <div className="visitor-currency-converter" aria-label="Exchange rate calculator">
   <h2>Currency converter</h2>
   {rates ? <>
    <div className="visitor-currency-controls">
     <label>Amount<input type="text" inputMode="decimal" value={amount} onChange={(e)=>setAmount(e.target.value)} aria-label="Amount to convert"/></label>
     <label>From<select value={from} onChange={(e)=>setFrom(e.target.value as Currency)}>{codes.map(c=><option value={c} key={c}>{c} — {names[c]}</option>)}</select></label>
     <label>To<select value={to} onChange={(e)=>setTo(e.target.value as Currency)}>{codes.map(c=><option value={c} key={c}>{c} — {names[c]}</option>)}</select></label>
    </div>
    <div className="visitor-conversion-result" role="status" aria-live="polite">
      {output!==null ? `${fmt(output,to)} ${to}` : "Enter a valid amount"}
    </div>
    <h3>Quick reference conversions</h3>
    <div className="visitor-currency-examples">{examples.map(([n,a,b])=><div key={a+b}><span>{n.toLocaleString("en-GB")} {a}</span><strong>{fmt(n*rates[b]/rates[a],b)} {b}</strong></div>)}</div>
    <p className="visitor-rate-note">Reference rates dated <time dateTime={rateDate||undefined}>{rateDate || "latest available working day"}</time>. These are indicative published rates, not the rate or fees charged by your bank, card issuer or exchange bureau.</p>
   </>:<p role="status">Live reference exchange rates are temporarily unavailable. Please check the Hungarian National Bank for the current rate. We do not display invented or outdated conversion amounts.</p>}
 </div>;
}
