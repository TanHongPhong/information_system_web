import { Facebook, Instagram, Twitter } from "./Icons";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white font-extrabold shadow-[0_10px_24px_rgba(37,99,235,.32)]">6A</div>
              <div className="font-semibold text-blue-700 text-xl md:text-2xl">6A Logistics</div>
            </div>
            <p className="mt-3 subtitle-soft text-sm">Nền tảng đặt xe chở hàng nhanh, minh bạch và an toàn.</p>
          </div>

          <div>
            <div className="font-semibold mb-2 text-blue-700">Dịch vụ</div>
            <ul className="space-y-1 text-sm subtitle-soft">
              <li><a className="hover:text-brand-600" href="#">Nội thành</a></li>
              <li><a className="hover:text-brand-600" href="#">Liên tỉnh</a></li>
              <li><a className="hover:text-brand-600" href="#">Bốc xếp</a></li>
              <li><a className="hover:text-brand-600" href="#">Giao 2 chiều</a></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-2 text-blue-700">Hỗ trợ</div>
            <ul className="space-y-1 text-sm subtitle-soft">
              <li><a className="hover:text-brand-600" href="#faq">FAQ</a></li>
              <li><a className="hover:text-brand-600" href="#">Liên hệ</a></li>
              <li><a className="hover:text-brand-600" href="#">Chính sách</a></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-2 text-blue-700">Kết nối</div>
            <div className="flex items-center gap-3 subtitle-soft">
              <Facebook className="w-5 h-5" />
              <Instagram className="w-5 h-5" />
              <Twitter className="w-5 h-5" />
            </div>
            <p className="mt-3 text-sm subtitle-soft">
              Hỗ trợ 24/7: <a className="text-brand-600 underline" href="tel:19001234">1900 1234</a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-xs text-slate-500">© 2025 6A Logistics. All rights reserved.</div>
      </div>
    </footer>
  );
}
