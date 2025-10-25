import React from "react";
import {
  MapPin,
  Target,
  User,
  Phone,
  Layers,
  Scale,
  Move,
  Edit3,
  CreditCard,
} from "lucide-react";

export default function CargoForm({
  origin,
  setOrigin,
  destination,
  setDestination,
  recipientName,
  setRecipientName,
  recipientPhone,
  setRecipientPhone,
  category,
  setCategory,
  weight,
  setWeight,
  len,
  setLen,
  wid,
  setWid,
  hei,
  setHei,
  note,
  setNote,
  onSubmit,
  onBack,
  submitText = "Thanh toán",
  hideContinue = true,
}) {
  return (
    <section className="lg:col-span-2">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl shadow-soft border border-slate-200 p-6 space-y-8"
      >
        {/* Địa điểm */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label required">Nơi gửi hàng</label>
            <div className="field mt-2">
              <MapPin className="icon" />
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
            <div className="field mt-2">
              <Target className="icon" />
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
            <div className="field mt-2">
              <User className="icon" />
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
            <div className="field mt-2">
              <Phone className="icon" />
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
            <div className="field mt-2">
              <Layers className="icon" />
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>
                  Chọn loại hàng
                </option>
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
            <div className="field mt-2">
              <Scale className="icon" />
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
              <Move className="icon" />
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
              <Move className="icon" />
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
              <Move className="icon" />
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
          <p className="help">
            Dùng để tính <b>khối lượng quy đổi</b> = D×R×C / 6000.
          </p>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="label">Ghi chú</label>
          <div className="field mt-2 field-note">
            <Edit3 className="icon" />
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
          <button
            type="button"
            onClick={onBack}
            className="link-brand underline underline-offset-2"
          >
            Trở lại
          </button>

          <div className="flex items-center gap-2">
            {!hideContinue ? (
              <button
                type="button"
                className="btn-reset inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50"
              >
                Tiếp tục
              </button>
            ) : null}

            <button
              type="submit"
              className="btn-reset btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <CreditCard className="w-4 h-4" />
              {submitText}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
