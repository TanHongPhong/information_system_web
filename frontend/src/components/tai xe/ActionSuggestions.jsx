import FeatherIcon from "./FeatherIcon";

export default function ActionSuggestions() {
  return (
    <section className="bg-white rounded-xl2 shadow-soft p-4">
      <div className="flex items-center gap-3">
        <FeatherIcon name="check-circle" className="w-5 h-5 text-emerald-600" />
        <div className="text-sm">
          Xác nhận:{" "}
          <span className="text-slate-600">
            Hàng đã chằng buộc an toàn, đủ niêm phong.
          </span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="w-full text-sm font-semibold rounded-lg py-2.5 bg-gradient-to-r from-brand-600 to-blue-600 text-white active:scale-[.98]">
          Đã rời bến
        </button>
        <button className="w-full text-sm font-semibold rounded-lg py-2.5 bg-slate-100 text-slate-800 active:scale-[.98]">
          Sự cố / Ghi chú
        </button>
      </div>
    </section>
  );
}
