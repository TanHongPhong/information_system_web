import { useNavigate } from "react-router-dom";

export default function MobileCTA() {
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
    <div className="md:hidden mobile-sticky z-30">
      <div className="mx-4 mb-4 rounded-2xl shadow-[0_10px_24px_rgba(37,99,235,.32)] border border-brand-200 bg-white/95 backdrop-blur p-3 flex items-center justify-between">
        <div className="text-sm">
          <div className="font-semibold text-slate-900">Đặt xe ngay</div>
          <div className="text-[11px] text-slate-500">Giá hiển thị rõ — nhận xe nhanh</div>
        </div>
        <button 
          onClick={() => checkAuthAndNavigate("/transport-companies")}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold btn-shine btn-blue"
        >
          Bắt đầu
        </button>
      </div>
    </div>
  );
}
