import { useEffect } from "react";
import feather from "feather-icons";

export default function CargoForm(props) {
  const {
    origin, setOrigin,
    destination, setDestination,
    recipientName, setRecipientName,
    recipientPhone, setRecipientPhone,
    category, setCategory,
    weight, setWeight,
    len, setLen, wid, setWid, hei, setHei,
    note, setNote,
  } = props;

  useEffect(() => { feather.replace({ width: 18, height: 18 }); });

  function onSubmit(e) {
    e.preventDefault();
    alert("Đã lưu thông tin hàng hóa. Bước tiếp theo: Xác nhận & thanh toán.");
  }

  return (
    <section className="lg:col-span-2">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-soft border border-slate-200 p-6 space-y-8">
        {/* Địa điểm */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label required">Nơi gửi hàng</label>
            <div className="mt-2 field">
              <i className="icon" data-feather="map-pin" />
              <input
                id="origin"
                type="text"
                placeholder="VD: Kho Thủ Đức"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label required">Nơi nhận</label>
            <div className="mt-2 field">
              <i className="icon" data-feather="target" />
              <input
                id="destination"
                type="text"
                placeholder="VD: Coopmart Q1"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Người nhận */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label required">Người nhận</label>
            <div className="mt-2 field">
              <i className="icon" data-feather="user" />
              <input
                id="recipient_name"
                type="text"
                placeholder="VD: Lương Quang Trè"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Số điện thoại</label>
            <div className="mt-2 field">
              <i className="icon" data-feather="phone" />
              <input
                id="recipient_phone"
                type="tel"
                inputMode="tel"
                placeholder="VD: 09xx xxx xxx"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Loại hàng + Cân nặng */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label required">Loại hàng</label>
            <div className="mt-2 field">
              <i className="icon" data-feather="layers" />
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>Chọn loại hàng</option>
                <option value="general">Hàng tổng hợp</option>
                <option value="fragile">Dễ vỡ</option>
                <option value="food">Thực phẩm</option>
                <option value="electronics">Điện tử</option>
                <option value="oversize">Cồng kềnh</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label required">Cân nặng</label>
            <div className="mt-2 field">
              <i className="icon" data-feather="scale" />
              <input
                id="weight"
                type="number"
                step="0.1"
                placeholder="VD: 1.5"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <span className="unit">kg</span>
            </div>
          </div>
        </div>

        {/* Kích thước */}
        <div>
          <label className="label">Kích thước hàng</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="field">
              <i className="icon" data-feather="move" />
              <input
                id="len"
                type="number"
                placeholder="Dài"
                value={len}
                onChange={(e) => setLen(e.target.value)}
              />
              <span className="unit">cm</span>
            </div>
            <div className="field">
              <i className="icon" data-feather="move" />
              <input
                id="wid"
                type="number"
                placeholder="Rộng"
                value={wid}
                onChange={(e) => setWid(e.target.value)}
              />
              <span className="unit">cm</span>
            </div>
            <div className="field">
              <i className="icon" data-feather="move" />
              <input
                id="hei"
                type="number"
                placeholder="Cao"
                value={hei}
                onChange={(e) => setHei(e.target.value)}
              />
              <span className="unit">cm</span>
            </div>
          </div>
          <p className="help">Dùng để tính <b>khối lượng quy đổi</b> = D×R×C / 6000.</p>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="label">Ghi chú</label>
          <div className="mt-2 field field-note">
            <i className="icon" data-feather="edit-3" />
            <textarea
              id="note"
              placeholder="Yêu cầu đóng gói, khung giờ giao, địa chỉ chi tiết..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <a href="./chon-xe.html" className="link-brand underline underline-offset-2">Trở lại</a>
          <div className="flex items-center gap-2">
            <button type="button" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-soft">
              Tiếp tục
              <i data-feather="arrow-right" className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="btn-reset btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <i data-feather="credit-card" className="w-4 h-4" />
              Thanh toán
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
