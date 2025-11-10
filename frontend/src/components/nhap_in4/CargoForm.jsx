// components/CargoForm.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Crosshair, User, Phone, Layers, Scale, Move, Edit3, CreditCard, Package, DollarSign } from "lucide-react";
import { Input, Select, TextArea, Lbl } from "./Fields";
import api from "../../lib/axios";

const cur = (v) => (v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function CargoForm({ onCalc, companyId, vehicleId, originRegion, destinationRegion, userId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warehouse, setWarehouse] = useState({ warehouse_name: "", address: "", full_address: "", region: "" });
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", email: "" });
  
  const [form, setForm] = useState({
    origin_detail: "", // Điểm đi (vị trí chính xác của hàng) - text input
    destination_detail: "", // Điểm đến (kho theo destination_region) - không cho chọn
    sender_name: "",
    sender_phone: "",
    recipient_name: "",
    recipient_phone: "",
    cargo_name: "",
    category: "",
    weight: "",
    len: "",
    wid: "",
    hei: "",
    declared_value: "",
    require_cold: false,
    require_danger: false,
    require_loading: false,
    require_insurance: false,
    note: "",
  });
  
  useEffect(() => {
    try {
      const userDataStr = localStorage.getItem("gd_user");
      if (!userDataStr) return;
      const userData = JSON.parse(userDataStr);
      const name = userData?.name || userData?.full_name || userData?.username || "";
      const phone = userData?.phone || userData?.phone_number || "";
      const email = userData?.email || "";
      setCustomerInfo({ name, phone, email });
      setForm((prev) => ({
        ...prev,
        sender_name: prev.sender_name || name,
        sender_phone: prev.sender_phone || phone,
      }));
    } catch (err) {
      console.warn("CargoForm: Unable to prefill customer info", err);
    }
  }, []);

  // Load warehouse info theo destination_region
  useEffect(() => {
    const loadWarehouse = async () => {
      // Nếu không có destination_region, mặc định là HCM
      const region = destinationRegion || 'HCM';
      
      console.log("🏭 CargoForm: Loading warehouse for region", region);
      
      try {
        const response = await api.get(`/warehouse/by-region?region=${encodeURIComponent(region)}`);
        if (response.data) {
          const warehouseData = {
            warehouse_name: response.data.warehouse_name || `Kho ${region}`,
            address: response.data.address || "",
            full_address: response.data.full_address || response.data.warehouse_name || `Kho ${region}`,
            region: response.data.region || region
          };
          
          console.log("✅ CargoForm: Loaded warehouse", warehouseData);
          
          setWarehouse(warehouseData);
          // Set destination_detail mặc định là địa chỉ kho
          setForm(prev => ({
            ...prev,
            destination_detail: warehouseData.full_address || warehouseData.warehouse_name || `Kho ${region}`
          }));
        }
      } catch (err) {
        console.error("Error loading warehouse info:", err);
        // Sử dụng giá trị mặc định theo region
        const defaultWarehouse = {
          warehouse_name: `Kho ${region}`,
          address: `Địa chỉ kho tại ${region}`,
          full_address: `Kho ${region} - Địa chỉ kho tại ${region}`,
          region: region
        };
        setWarehouse(defaultWarehouse);
        setForm(prev => ({
          ...prev,
          destination_detail: defaultWarehouse.full_address
        }));
      }
    };
    
    loadWarehouse();
  }, [destinationRegion]); // Reload khi destinationRegion thay đổi
  

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const setBool = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.checked }));

  const numbers = {
    weight: parseFloat(form.weight) || 0,
    len: parseFloat(form.len) || 0,
    wid: parseFloat(form.wid) || 0,
    hei: parseFloat(form.hei) || 0,
  };

  const calc = useMemo(() => {
    const w = numbers.weight;
    const { len, wid, hei } = numbers;
    const vol = len && wid && hei ? (len * wid * hei) / 6000 : 0;
    const charge = w;
    const base = 20000;
    const perKg = 8000 * charge;

    const autoCold = form.category === "food";
    const autoDanger = form.category === "dangerous";
    const autoLoading = form.category === "oversize";

    const requireCold = form.require_cold || autoCold;
    const requireDanger = form.require_danger || autoDanger;
    const requireLoading = form.require_loading || autoLoading;
    const requireInsurance = form.require_insurance;

    const declaredValue = parseFloat(form.declared_value) || 0;

    let srv = 0;
    if (requireCold) srv += 50000;
    if (requireDanger) srv += 120000;
    if (requireLoading) srv += 40000;
    if (requireInsurance) {
      const insuranceFee = declaredValue > 0 ? Math.max(declaredValue * 0.01, 80000) : 80000;
      srv += Math.round(insuranceFee);
    }

    const total = Math.round(base + perKg + srv);

    return {
      wReal: w,
      wVol: vol,
      wCharge: charge,
      base,
      perKg,
      srv,
      total,
      declaredValue,
      flags: { requireCold, requireDanger, requireLoading, requireInsurance },
    };
  }, [
    numbers.weight,
    numbers.len,
    numbers.wid,
    numbers.hei,
    form.category,
    form.require_cold,
    form.require_danger,
    form.require_loading,
    form.require_insurance,
    form.declared_value,
  ]);

  const { wReal, wVol, wCharge, base, perKg, srv, total, declaredValue, flags } = calc;
  const autoServices = {
    cold: form.category === "food",
    danger: form.category === "dangerous",
    loading: form.category === "oversize",
  };

  // Update parent state via useEffect (không được gọi trong render)
  useEffect(() => {
    onCalc?.({ wReal, wVol, wCharge, base, perKg, srv, total, declaredValue });
  }, [wReal, wVol, wCharge, base, perKg, srv, total, declaredValue, onCalc]);

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
        general: "Hàng tổng hợp",
        fragile: "Dễ vỡ",
        food: "Thực phẩm",
        electronics: "Điện tử",
        oversize: "Cồng kềnh",
        dangerous: "Hàng nguy hiểm",
      };

      // Calculate total amount: base + perKg + srv
      const totalAmount = total;

      // Lấy customer_id từ localStorage nếu user đang đăng nhập
      // Sử dụng key 'gd_user' (giống như các component khác trong app)
      let customerId = userId ? Number(userId) || userId : null;

      if (!customerId) {
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
      }
      
      if (!customerId) {
        console.warn("📦 CargoForm - ⚠️ customer_id is NULL! Order will be created without customer_id.");
      }

      const contactName = (form.sender_name || customerInfo.name || "").trim();
      const contactPhone = (form.sender_phone || customerInfo.phone || "").trim();

      const finalCargoName =
        (form.cargo_name || "").trim() ||
        (form.category ? categoryMap[form.category] || form.category : "Hàng tổng hợp");

      const extraNoteSections = [];
      if (form.note?.trim()) extraNoteSections.push(form.note.trim());
      if (form.recipient_name || form.recipient_phone) {
        const recipientLine = `Người nhận: ${form.recipient_name || "—"}${
          form.recipient_phone ? ` (${form.recipient_phone})` : ""
        }`;
        extraNoteSections.push(recipientLine);
      }
      if (form.len || form.wid || form.hei) {
        const dimsLine = `Kích thước (cm): ${form.len || "—"} x ${form.wid || "—"} x ${form.hei || "—"}`;
        extraNoteSections.push(dimsLine);
      }
      if (declaredValue > 0) {
        extraNoteSections.push(`Giá trị khai báo: ${Number(declaredValue).toLocaleString("vi-VN")} VND`);
      }
      const finalNote = extraNoteSections.length > 0 ? extraNoteSections.join(" | ") : null;

      const declaredValueRounded = declaredValue > 0 ? Math.round(declaredValue) : null;

      const payload = {
        company_id: Number(companyId),
        vehicle_id: vehicleId ? Number(vehicleId) : null,
        customer_id: customerId ? Number(customerId) || customerId : null, // Truyền customer_id để đảm bảo được lưu đúng
        cargo_name: finalCargoName,
        cargo_type: form.category || null,
        weight_kg: numbers.weight || null,
        volume_m3: volumeM3,
        value_vnd: totalAmount, // Lưu tổng tạm tính (phí cần thanh toán)
        declared_value_vnd: declaredValueRounded,
        require_cold: flags.requireCold,
        require_danger: flags.requireDanger,
        require_loading: flags.requireLoading,
        require_insurance: flags.requireInsurance,
        pickup_address: form.origin_detail || (originRegion ? `${originRegion}` : ""),
        dropoff_address:
          form.destination_detail ||
          warehouse.full_address ||
          (destinationRegion ? `Kho ${destinationRegion}` : "Kho HCM"),
        pickup_time: null, // Có thể thêm datetime picker sau
        note: finalNote,
        contact_name: contactName || null,
        contact_phone: contactPhone || null,
        recipient_name: form.recipient_name || null,
        recipient_phone: form.recipient_phone || null,
      };

      console.log("📦 CargoForm - Creating order with payload:", JSON.stringify(payload, null, 2));
      const response = await api.post("/cargo-orders", payload);
      
      if (response.data.success) {
        try {
          localStorage.setItem(
            "last_cargo_params",
            JSON.stringify({
              companyId: companyId || null,
              vehicleId: vehicleId || null,
              origin_region: originRegion || null,
              destination_region: destinationRegion || null,
              userId: customerId || userId || null,
              orderId: response.data.data?.order_id || null,
            })
          );
        } catch (storageErr) {
          console.warn("📦 CargoForm - Unable to persist last_cargo_params", storageErr);
        }

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
      {/* Điểm đi - Text input để nhập vị trí chính xác của hàng */}
      <div>
        <Lbl required>Điểm lấy hàng (Vị trí chính xác)</Lbl>
        <Input 
          icon={<MapPin className="w-4 h-4" />} 
          placeholder="VD: 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh" 
          required
          value={form.origin_detail || ""} 
          onChange={set("origin_detail")} 
        />
        <p className="text-xs text-slate-500 mt-1">Nhập địa chỉ chính xác nơi lấy hàng</p>
      </div>
      
      {/* Điểm đến - Kho theo destination_region (không cho chọn) */}
      <div>
        <Lbl required>Điểm giao hàng ({warehouse.warehouse_name || (destinationRegion ? `Kho ${destinationRegion}` : "Kho HCM")})</Lbl>
        <Input 
          icon={<Crosshair className="w-4 h-4" />} 
          value={warehouse.full_address || form.destination_detail || (destinationRegion ? `Kho ${destinationRegion}` : "Kho HCM")} 
          disabled
          readOnly
          className="bg-slate-100 cursor-not-allowed"
        />
        <p className="text-xs text-slate-500 mt-1">
          {destinationRegion 
            ? `Điểm đến: Kho ${destinationRegion}`
            : "Điểm đến mặc định là Kho HCM"}
        </p>
      </div>

      {/* Người đặt hàng */}
      <div>
        <Lbl required>Thông tin người đặt</Lbl>
        <div className="grid sm:grid-cols-2 gap-4 mt-2">
          <Input
            icon={<User className="w-4 h-4" />}
            placeholder="Tên người đặt"
            required
            value={form.sender_name}
            onChange={set("sender_name")}
          />
          <Input
            icon={<Phone className="w-4 h-4" />}
            inputMode="tel"
            placeholder="Số điện thoại liên hệ"
            value={form.sender_phone}
            onChange={set("sender_phone")}
          />
        </div>
        {customerInfo.email ? (
          <p className="text-xs text-slate-500 mt-1">
            Email liên hệ: <span className="font-medium text-slate-700">{customerInfo.email}</span>
          </p>
        ) : null}
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

      {/* Thông tin hàng hóa */}
      <div>
        <Lbl required>Tên hàng hóa</Lbl>
        <Input
          icon={<Package className="w-4 h-4" />}
          placeholder="VD: Sữa tiệt trùng thùng 12 hộp"
          required
          value={form.cargo_name}
          onChange={set("cargo_name")}
        />
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
            <option value="dangerous">Hàng nguy hiểm</option>
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

      {/* Giá trị khai báo */}
      <div>
        <Lbl>Giá trị khai báo (VNĐ)</Lbl>
        <Input
          icon={<DollarSign className="w-4 h-4" />}
          type="number"
          min="0"
          step="1000"
          placeholder="VD: 12.000.000"
          value={form.declared_value}
          onChange={set("declared_value")}
        />
        <p className="text-[12px] text-slate-500 mt-1">
          Giá trị này giúp tính phí bảo hiểm và trách nhiệm bồi thường nếu phát sinh sự cố.
        </p>
      </div>

      {/* Dịch vụ bổ sung */}
      <div>
        <Lbl>Dịch vụ bổ sung</Lbl>
        <div className="grid sm:grid-cols-2 gap-3 mt-2 text-sm">
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-3 hover:border-blue-300 transition">
            <input
              type="checkbox"
              className="mt-1 accent-blue-600"
              checked={flags.requireCold}
              onChange={setBool("require_cold")}
              disabled={autoServices.cold}
            />
            <span>
              <span className="font-semibold text-slate-700">Bảo quản lạnh</span>
              <span className="block text-xs text-slate-500">
                Duy trì nhiệt độ ổn định cho hàng dễ hỏng. {autoServices.cold ? "Bắt buộc với loại hàng đã chọn." : ""}
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-3 hover:border-blue-300 transition">
            <input
              type="checkbox"
              className="mt-1 accent-blue-600"
              checked={flags.requireDanger}
              onChange={setBool("require_danger")}
            />
            <span>
              <span className="font-semibold text-slate-700">Hàng nguy hiểm</span>
              <span className="block text-xs text-slate-500">
                Áp dụng các biện pháp an toàn theo quy chuẩn ADR/IMDG.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-3 hover:border-blue-300 transition">
            <input
              type="checkbox"
              className="mt-1 accent-blue-600"
              checked={flags.requireLoading}
              onChange={setBool("require_loading")}
              disabled={autoServices.loading}
            />
            <span>
              <span className="font-semibold text-slate-700">Hỗ trợ bốc xếp</span>
              <span className="block text-xs text-slate-500">
                Cần xe nâng/khoang bốc xếp tại kho. {autoServices.loading ? "Bắt buộc với hàng quá khổ." : ""}
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-3 hover:border-blue-300 transition">
            <input
              type="checkbox"
              className="mt-1 accent-blue-600"
              checked={flags.requireInsurance}
              onChange={setBool("require_insurance")}
            />
            <span>
              <span className="font-semibold text-slate-700">Mua bảo hiểm</span>
              <span className="block text-xs text-slate-500">
                Bồi thường lên tới 100% giá trị khai báo. Phụ phí tạm tính đã cộng vào phần chi phí.
              </span>
            </span>
          </label>
        </div>
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
          onClick={() => {
            const params = new URLSearchParams();
            if (companyId) params.append("companyId", companyId);
            if (vehicleId) params.append("vehicleId", vehicleId);
            if (originRegion) params.append("origin_region", originRegion);
            if (destinationRegion) params.append("destination_region", destinationRegion);
            if (userId) params.append("userId", userId);
            const query = params.toString();
            navigate(`/vehicle-list${query ? `?${query}` : ""}`);
          }}
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
