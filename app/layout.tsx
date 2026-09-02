import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"MAVI Personalizados | Tienda online",description:"Compra poleras, polerones, gorras, delantales, chapitas, tazas, tazones, shoperos y toppers personalizados con despacho a todo Chile.",icons:{icon:"/favicon.png"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="es"><body>{children}</body></html>}
