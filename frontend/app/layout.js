import "./globals.css";

export const metadata = {
  title: "GoPratle | Event Requirements Portal",
  description: "Post event requirements for planners, performers, and crew",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
