// components/CargoForm.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Crosshair, User, Phone, Layers, Scale, Move, Edit3, CreditCard } from "lucide-react";
import { Input, Select, TextArea, Lbl } from "./Fields";
import api from "../../lib/axios";

const cur = (v) => (v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function CargoForm({ onCalc, companyId, vehicleId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    origin: "", destination: "", recipient_name: "", recipient_phone: "",
    category: "", weight: "", len: "", wid: "", hei: "", note: "",
  });

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const numbers = {
    weight: parseFloat(form.weight) || 0,
    len: parseFloat(form.len) || 0,
    wid: parseFloat(form.wid) || 0,
    hei: parseFloat(form.hei) || 0,
  };

  const { wReal, wVol, wCharge, base, perKg, srv } = useMemo(() => {
    const w = numbers.weight;
    const { len, wid, hei } = numbers;
    const vol = len && wid && hei ? (len * wid * hei) / 6000 : 0;
    // Chỉ tính theo cân nặng thực, không tính theo thể tích
    const charge = w; // Chỉ dùng weight, bỏ qua volume
    const base = 20000;
    const perKg = 8000 * charge;
    const srv = 0;
    return { wReal: w, wVol: vol, wCharge: charge, base, perKg, srv };
  }, [numbers.weight, numbers.len, numbers.wid, numbers.hei]);

  // Update parent state via useEffect (không được gọi trong render)
  useEffect(() => {
    onCalc?.({ wReal, wVol, wCharge, base, perKg, srv });
  }, [wReal, wVol, wCharge, base, perKg, srv, onCalc]);

  const submit = async (e) => {
    e.preventDefault();
    
    if (!companyId) {
      alert("Vui lòng chọn công ty vận chuyển trước!");
      navigate("/transport-companies");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate volume in m³ (convert from cm³)
      const volumeM3 = numbers.len && numbers.wid && numbers.hei
        ? (numbers.len * numbers.wid * numbers.hei) / 1000000 // cm³ to m³
        : null;

      // Map category to cargo_type mapping
      const categoryMap = {
        "general": "Hàng tổng hợp",
        "fragile": "Dễ vỡ",
        "food": "Thực phẩm",
        "electronics": "Điện tử",
        "oversize": "Cồng kềnh",
      };

      // Calculate total amount: base + perKg + srv
      const totalAmount = Math.round(base + perKg + srv);

      // Lấy customer_id từ localStorage nếu user đang đăng nhập
      // Sử dụng key 'gd_user' (giống như các component khác trong app)
      let customerId = null;
      try {
        const userDataStr = localStorage.getItem('gd_user'); // Sửa từ 'user' thành 'gd_user'
        const role = localStorage.getItem('role');
        if (userDataStr && role === 'user') {
          const userData = JSON.parse(userDataStr);
          if (userData.id) {
            customerId = userData.id;
            console.log("📦 CargoForm - Found customer_id from localStorage:", customerId);
            console.log("📦 CargoForm - User data:", { id: userData.id, email: userData.email, role: userData.role });
          } else {
            console.warn("📦 CargoForm - User data exists but no id found:", userData);
          }
        } else {
          console.warn("📦 CargoForm - No user data or wrong role:", { hasUserData: !!userDataStr, role });
        }
      } catch (e) {
        console.error("📦 CargoForm - Error getting customer_id from localStorage:", e);
      }
      
      if (!customerId) {
        console.warn("📦 CargoForm - ⚠️ customer_id is NULL! Order will be created without customer_id.");
      }

      const payload = {
        company_id: Number(companyId),
        vehicle_id: vehicleId ? Number(vehicleId) : null,
        customer_id: customerId, // Truyền customer_id để đảm bảo được lưu đúng
        cargo_name: form.category ? categoryMap[form.category] || form.category : "Hàng tổng hợp",
        cargo_type: form.category || null,
        weight_kg: numbers.weight || null,
        volume_m3: volumeM3,
        value_vnd: totalAmount, // Lưu tổng tiền đã tính từ form
        require_cold: form.category === "food",
        require_danger: false,
        require_loading: form.category === "oversize",
        require_insurance: false,
        pickup_address: form.origin,
        dropoff_address: form.destination,
        pickup_time: null, // Có thể thêm datetime picker sau
        note: form.note || null,
      };

      console.log("📦 CargoForm - Creating order with payload:", JSON.stringify(payload, null, 2));
      const response = await api.post("/cargo-orders", payload);
      
      if (response.data.success) {
        // Navigate to payment page with order ID
        navigate(`/payment-qr?orderId=${response.data.data.order_id}`);
      }
    } catch (err) {
      console.error("Error creating cargo order:", err);
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra khi tạo đơn hàng");
      alert("Lỗi: " + (err.response?.data?.message || err.message || "Không thể tạo đơn hàng"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,.08)] border border-slate-200 p-6 space-y-8">
      {/* Địa điểm */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Lbl required>Nơi gửi hàng</Lbl>
          <Input icon={<MapPin className="w-4 h-4" />} placeholder="VD: Kho Thủ Đức" required value={form.origin} onChange={set("origin")} />
        </div>
        <div>
          <Lbl required>Nơi nhận</Lbl>
          <Input icon={<Crosshair className="w-4 h-4" />} placeholder="VD: Coopmart Q1" required value={form.destination} onChange={set("destination")} />
        </div>
      </div>

      {/* Người nhận */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Lbl required>Người nhận</Lbl>
          <Input icon={<User className="w-4 h-4" />} placeholder="VD: Lương Quang Trè" required value={form.recipient_name} onChange={set("recipient_name")} />
        </div>
        <div>
          <Lbl>Số điện thoại</Lbl>
          <Input icon={<Phone className="w-4 h-4" />} inputMode="tel" placeholder="VD: 09xx xxx xxx" value={form.recipient_phone} onChange={set("recipient_phone")} />
        </div>
      </div>

      {/* Loại hàng + Cân nặng */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Lbl required>Loại hàng</Lbl>
          <Select icon={<Layers className="w-4 h-4" />} required value={form.category} onChange={set("category")}>
            <option value="">Chọn loại hàng</option>
            <option value="general">Hàng tổng hợp</option>
            <option value="fragile">Dễ vỡ</option>
            <option value="food">Thực phẩm</option>
            <option value="electronics">Điện tử</option>
            <option value="oversize">Cồng kềnh</option>
          </Select>
        </div>
        <div>
          <Lbl required>Cân nặng</Lbl>
          <Input icon={<Scale className="w-4 h-4" />} type="number" step="0.1" placeholder="VD: 1.5" unit="kg" required value={form.weight} onChange={set("weight")} />
        </div>
      </div>

      {/* Kích thước */}
      <div>
        <Lbl>Kích thước hàng</Lbl>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Input icon={<Move className="w-4 h-4" />} type="number" placeholder="Dài" unit="cm" value={form.len} onChange={set("len")} />
          <Input icon={<Move className="w-4 h-4" />} type="number" placeholder="Rộng" unit="cm" value={form.wid} onChange={set("wid")} />
          <Input icon={<Move className="w-4 h-4" />} type="number" placeholder="Cao" unit="cm" value={form.hei} onChange={set("hei")} />
        </div>
        <p className="text-[12px] text-slate-500 mt-1">Dùng để tính <b>khối lượng quy đổi</b> = D×R×C / 6000.</p>
      </div>

      {/* Ghi chú */}
      <div>
        <Lbl>Ghi chú</Lbl>
        <TextArea icon={<Edit3 className="w-4 h-4" />} placeholder="Yêu cầu đóng gói, khung giờ giao, địa chỉ chi tiết..." value={form.note} onChange={set("note")} />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/vehicle-list" + (companyId ? `?companyId=${companyId}` : ""))}
          className="text-blue-700 underline underline-offset-2 hover:text-blue-800"
        >
          Trở lại
        </button>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-[0_12px_40px_rgba(2,6,23,.08)] focus:outline-none focus:ring-2 focus:ring-blue-200 bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" /> Thanh toán
              </>
            )}
          </button>
        </div>
      </div>

      {/* (Optional) hiển thị nhỏ để dev check nhanh tính toán */}
      <div className="hidden text-xs text-slate-500">
        wReal:{wReal} • wVol:{wVol} • wCharge:{wCharge} • base:{cur(20000)} • perKg:{cur(perKg)}
      </div>
    </form>
  );
}
