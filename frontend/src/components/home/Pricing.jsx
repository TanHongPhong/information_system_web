import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const navigate = useNavigate();

  const checkAuthAndNavigate = (path) => {
    const user = localStorage.getItem("gd_user");
    if (user) {
      navigate(path);
    } else {
      alert("Vui lòng đăng nhập để tiếp tục!");
      navigate("/sign-in");
    }
  };

  return (
    <section id="pricing" className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold title-grad">Bảng giá theo tải trọng</h2>
          <a href="#" className="text-sm font-light text-blue-700 underline">Cách tính phí</a>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <div key={i} className={`${c.featured
                ? "rounded-2xl border-2 border-brand-200 bg-gradient-to-b from-brand-50 to-white p-6 shadow-[0_10px_24px_rgba(37,99,235,.32)]"
                : "rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-[0_10px_24px_rgba(37,99,235,.32)] transition"
              }`}
            >
              {c.featured && <div className="inline-flex text-xs font-semibold text-brand-700 bg-white/70 border border-brand-100 px-2 py-0.5 rounded-full">Phổ biến</div>}
              <div className={`mt-${c.featured ? "2" : "0"} text-sm font-semibold text-brand-700`}>{c.title}</div>
              <div className="mt-1 text-3xl font-extrabold text-slate-900">
                {c.price}<span className="text-base text-slate-500"> / 4km</span>
              </div>
              <ul className="mt-3 text-sm subtitle-soft space-y-1">
                {c.points.map(p => <li key={p}>{p}</li>)}
              </ul>
              <button 
                onClick={() => checkAuthAndNavigate("/vehicle-list")}
                className="mt-4 w-full py-2.5 rounded-xl text-white font-semibold btn-shine bg-green-600 hover:bg-green-700"
              >
                Chọn
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const cards = [
  { title: "Van", price: "~105k", points: ["≤ 500kg • hàng nhỏ gọn", "Giao nội thành nhanh", "Phí chờ minh bạch"] },
  { featured: true, title: "Xe tải nhỏ", price: "~150k", points: ["750kg – 1 tấn", "Đồ điện tử, văn phòng", "Tuỳ chọn bốc xếp"] },
  { title: "Xe tải trung", price: "~220k", points: ["1.5 – 2.5 tấn", "Hàng cồng kềnh, máy móc", "Giao liên tỉnh ổn định"] },
];
