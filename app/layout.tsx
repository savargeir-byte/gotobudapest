import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata:Metadata={
 title:"GoToBudapest — A city worth getting lost in",
 description:"Explore Budapest's attractions, Danube cruises, thermal baths, Castle District and Downtown Pest with locally researched visitor guides.",
 icons:{icon:"/favicon.ico"},
 openGraph:{title:"GoToBudapest — Your next city story",description:"Discover Budapest's iconic sights, riverfront and neighbourhoods.",type:"website"}
};
export const viewport:Viewport={themeColor:"#081b26"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 return <html lang="en"><body>{children}</body></html>;
}
