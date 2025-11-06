// src/components/login/Footer.jsx
import { Facebook, Instagram, Twitter } from "./Icons";

export default function Footer() {
  return (
    <footer className="border-t border-white/40 bg-gradient-to-r from-cyan-400/20 via-indigo-400/20 to-fuchsia-400/20 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between text-blue-900">
        <div className="flex items-center gap-2">
          <img src="/web_logo.png" alt="6A Logistics" className="h-8 w-8 rounded-xl object-contain" />
          <div className="text-sm">© 2025 6A Logistics</div>
        </div>
        <div className="flex items-center gap-3">
          <Facebook className="w-5 h-5" />
          <Instagram className="w-5 h-5" />
          <Twitter className="w-5 h-5" />
        </div>
      </div>
      <div className="h-[3px] w-full bg-ribbon animate-shine" />
    </footer>
  );
}
