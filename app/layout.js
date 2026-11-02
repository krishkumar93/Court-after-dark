import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Courts After Dark | LPU Vertos Sports Arena & Night Court Booking",
  description:
    "Official night sports facility booking portal for Lovely Professional University (LPU Punjab). Reserve floodlit courts, turf grounds, and sports gear across Shanti Devi Mittal Indoor Complex, Baldev Raj Mittal Unipolis, and Block 34 Stadium.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-dark-900 text-slate-100 antialiased selection:bg-primary-400 selection:text-dark-950">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
