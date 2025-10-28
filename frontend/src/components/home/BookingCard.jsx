import { useNavigate } from "react-router-dom";
import { Search } from "./Icons";

export default function BookingCard() {
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
    <div id="booking" className="glass rounded-2xl border border-white/80 p-6 lg:p-7 animate-float">
      <div className="text-lg font-semibold text-blue-600">Đặt chuyến nhanh</div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nơi gửi hàng" placeholder="VD: 12 Nguyễn Huệ, Q.1, HCM" />
        <Field label="Nơi nhận hàng" placeholder="VD: KCN Long Thành, Đồng Nai" />
        <Field label="Ngày & giờ" type="datetime-local" />
        <div>
          <label className="text-sm text-slate-600">Loại xe</label>
          <select className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200/70 bg-white/70 focus:outline-none focus:ring-2 focus:ring-brand-200">
            <option>Van 500kg</option>
            <option>Xe tải 750kg</option>
            <option>Xe tải 1 tấn</option>
            <option>Xe tải 1.5 tấn</option>
            <option>Xe tải 2.5 tấn</option>
          </select>
        </div>
        <Field label="Trọng lượng ước tính" type="number" placeholder="kg" />
        <Field label="Ghi chú" placeholder="Hàng dễ vỡ / có bốc xếp" />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <a href="#pricing" className="text-sm font-medium text-blue-600 underline underline-offset-4">Ước tính chi phí</a>
        <button 
          onClick={() => checkAuthAndNavigate("/transport-companies")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-[0_10px_24px_rgba(37,99,235,.32)] btn-shine btn-blue"
        >
          <Search className="w-4 h-4" /> Tìm chuyến
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Giá hiển thị trước khi đặt, có thể thay đổi theo km, tải trọng và dịch vụ thêm.
      </p>
    </div>
  );
}

function Field({ label, type = "text", placeholder }) {
  return (
    <div>
      <label className="text-sm text-slate-600">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200/70 bg-white/70 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}
