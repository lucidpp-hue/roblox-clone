
import "./globals.css";

export const metadata = {
  title: "Roblox Developer Simulator",
  description: "Simulate being a Roblox game developer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-900 text-white">
        {children}
      </body>
    </html>
  );
}
