import "./globals.css";

export const metadata = {
  title: "Retail POS & Inventory System",
  description: "High-performance Retail Management & Point of Sale System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
