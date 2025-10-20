// src/components/login/RolePanel.jsx
export default function RolePanel() {
  return (
    <aside className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-blueglow">
      <h3 className="text-xl font-extrabold text-[#14532d]">Quyền truy cập theo vai trò</h3>
      <ul className="mt-3 list-disc pl-5 space-y-3 text-[15px]">
        <li>
          <b>Khách:</b> xem trang chủ, tạo yêu cầu báo giá, theo dõi đơn bằng mã theo dõi, nhận thông báo trạng thái cơ bản
        </li>
        <li>
          <b>Tài xế:</b> nhận/chấp nhận chuyến, điều hướng tới điểm giao/nhận, cập nhật trạng thái, chụp POD/biên nhận, liên hệ người gửi/nhận
        </li>
        <li>
          <b>Doanh nghiệp:</b> tạo &amp; quản lý đơn, sổ địa chỉ, theo dõi realtime, xuất CSV/Excel, đối soát công nợ
        </li>
        <li>
          <b>Nhà kho:</b> quét mã vận đơn, xác nhận nhập/xuất, đối soát tồn, phân tuyến nội bộ, in tem nhãn
        </li>
      </ul>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <a
          href="homepage.html"
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm"
        >
          ← Quay lại
        </a>
        <a href="homepage.html#faq" className="px-4 py-2.5 rounded-xl text-white text-sm btn-shine btn-blue">
          Xem FAQ
        </a>
      </div>
    </aside>
  );
}
