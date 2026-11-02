import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "LPU Sports Portal | Lovely Professional University, Phagwara",
  description:
    "Official student sports facility booking portal for Lovely Professional University (LPU Punjab). Explore 35+ campus facilities, book floodlit badminton, basketball, football, Olympic swimming, and rent sports gear across Shanti Devi Mittal Indoor Complex, Baldev Raj Mittal Unipolis, and Block 34 Stadium.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-[#a71d2a] selection:text-white">
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
