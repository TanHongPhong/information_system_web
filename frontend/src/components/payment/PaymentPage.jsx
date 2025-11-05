// components/PaymentPage.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, Shield, Clock, Download, Copy, RefreshCw, Loader, Check, XCircle, Home, History, X } from "lucide-react";
import OrderDetails from "./OrderDetails";
import { buildSepayQrUrl } from "../../lib/sepay";
import api from "../../lib/axios";

const VND = (n) => {
  try {
    const num = Number(n);
    if (isNaN(num) || num <= 0) return "0";
    return num.toLocaleString("vi-VN");
  } catch {
    return "0";
  }
};

export default function PaymentPage({ orderId }) {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Payment state
  const [status, setStatus] = useState("pending"); // 'pending' | 'success' | 'expired'
  const [orderTime, setOrderTime] = useState("—");
  const [method, setMethod] = useState("momo");
  const [remain, setRemain] = useState(15 * 60); // seconds
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const transactionSavedRef = useRef(false); // Flag để tránh duplicate calls

  // Fetch order data
  useEffect(() => {
    let aborted = false;
    
    async function fetchOrder() {
      if (!orderId) {
        if (!aborted) {
          setError("Không tìm thấy mã đơn hàng");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch order by ID (order_id giờ là VARCHAR(4))
        const response = await api.get(`/cargo-orders?order_id=${orderId}`);
        const orders = response.data || [];
        const order = Array.isArray(orders) ? orders.find(o => o.order_id === String(orderId)) : null;
        
        if (!order) {
          throw new Error("Đơn hàng không tồn tại");
        }
        
        if (!aborted) {
          setOrderData(order);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        if (!aborted) {
          setError(err.response?.data?.message || err.message || "Không thể tải thông tin đơn hàng");
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    fetchOrder();
    return () => { aborted = true; };
  }, [orderId]);

  // Calculate amount from order - giá trị thực để hiển thị
  const amount = useMemo(() => {
    if (!orderData) return 0;
    try {
      // Ưu tiên dùng value_vnd từ database (đã được tính trong CargoForm)
      if (orderData.value_vnd) {
        const val = Number(orderData.value_vnd);
        if (!isNaN(val) && val > 0) {
          return val;
        }
      }
      // Fallback: Tính lại nếu không có value_vnd
      // Tính theo công thức: base + weight * rate (chỉ tính theo cân nặng)
      const base = 20000;
      const weight = Number(orderData.weight_kg) || 0;
      const rate = 8000;
      
      // Chỉ tính theo cân nặng thực, không tính theo thể tích
      return base + (weight * rate);
    } catch {
      return 0;
    }
  }, [orderData]);

  // Số tiền thực tế cho QR code/webhook: 2000 + (amount / 1000) để test
  const payAmount = useMemo(() => {
    const v = Number(amount) || 0;
    // Công thức: 2000 + (số tiền giao dịch / 1000)
    const testAmount = 2000 + Math.round(v / 1000);
    return Math.max(2000, testAmount); // Tối thiểu 2000
  }, [amount]);

  const provider = orderData?.company_name || "—";
  const orderCode = orderId ? String(orderId).padStart(12, "0") : "000000000000";
  const note = orderId ? `GMD-${orderCode}` : "—";

  const handleSaveTransaction = useCallback(async () => {
    if (!orderId || !orderData || !payAmount || payAmount <= 0) {
      console.warn("Cannot save transaction: missing data", { orderId, orderData: !!orderData, payAmount });
      return;
    }
    
    // Prevent duplicate calls
    if (transactionSavedRef.current) {
      console.warn("Transaction already being saved, skipping");
      return;
    }
    
    transactionSavedRef.current = true;
    
    try {
      // Lấy customer_id từ orderData (ưu tiên)
      let customerId = orderData.customer_id;
      console.log("💳 PaymentPage - orderData.customer_id:", customerId);
      console.log("💳 PaymentPage - Full orderData:", JSON.stringify(orderData, null, 2));
      
      // Nếu không có trong orderData, thử lấy từ localStorage
      // Sử dụng key 'gd_user' (giống như các component khác trong app)
      if (!customerId) {
        console.log("💳 PaymentPage - customer_id not in orderData, trying localStorage...");
        try {
          const userDataStr = localStorage.getItem('gd_user'); // Sửa từ 'user' thành 'gd_user'
          const role = localStorage.getItem('role');
          if (userDataStr && role === 'user') {
            const userData = JSON.parse(userDataStr);
            console.log("💳 PaymentPage - User from localStorage:", userData);
            if (userData.id) {
              customerId = userData.id;
              console.log("💳 PaymentPage - Found customer_id from localStorage:", customerId);
            } else {
              console.warn("💳 PaymentPage - User data exists but no id found:", userData);
            }
          } else {
            console.warn("💳 PaymentPage - No user data or wrong role:", { hasUserData: !!userDataStr, role });
          }
        } catch (e) {
          console.error("💳 PaymentPage - Error getting customer_id from localStorage:", e);
        }
      }
      
      if (!customerId) {
        console.warn("💳 PaymentPage - ⚠️ customer_id is NULL! Transaction will be created without customer_id.");
      }
      
      // Đảm bảo order_id là string 4 chữ số (VARCHAR(4) format)
      const formattedOrderId = String(orderId).padStart(4, '0').substring(0, 4);
      
      const transactionData = {
        order_id: formattedOrderId, // VARCHAR(4) format: "0001", "1234", etc.
        company_id: Number(orderData.company_id),
        customer_id: customerId || null, // Truyền customer_id để đảm bảo được lưu đúng
        amount: Number(payAmount),
        payment_method: method,
        payment_status: "SUCCESS",
        transaction_code: `TXN-${Date.now()}`,
        note: `Payment for order #${orderId}`,
      };
      
      console.log("💳 PaymentPage - Sending transaction data:", JSON.stringify(transactionData, null, 2));
      
      const response = await api.post("/transactions", transactionData);
      console.log("💳 PaymentPage - Transaction saved successfully:", JSON.stringify(response.data, null, 2));
      
      // Verify customer_id was saved
      if (response.data?.data?.customer_id) {
        console.log("✅ PaymentPage - Customer ID confirmed in response:", response.data.data.customer_id);
      } else {
        console.warn("⚠️ PaymentPage - Customer ID not found in response!");
      }
    } catch (err) {
      console.error("💳 PaymentPage - Error saving transaction:", err);
      console.error("💳 PaymentPage - Error response:", err.response?.data);
      transactionSavedRef.current = false; // Reset để retry nếu cần
      // Không throw error để không crash app, chỉ log
    }
  }, [orderId, orderData, payAmount, method]);

  // Reset countdown và status khi orderData load xong (chỉ 1 lần)
  useEffect(() => {
    if (!orderData || loading) return;
    
    // Reset transaction flag khi order mới
    transactionSavedRef.current = false;
    
    // Reset countdown và status
    setRemain(15 * 60);
    setStatus("pending");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData?.order_id]); // Chỉ reset khi order_id thay đổi (đơn hàng mới)

  // countdown timer - chạy độc lập
  useEffect(() => {
    if (status !== "pending" || loading) return;
    
    const iv = setInterval(() => {
      setRemain((prev) => {
        if (prev <= 1) {
          setStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(iv);
  }, [status, loading]); // Chỉ chạy khi status là pending

  // Bỏ auto-success; chỉ xác nhận khi người dùng bấm "Tôi đã thanh toán" hoặc khi webhook xác nhận

  const mmss = useMemo(() => {
    const m = String(Math.floor(remain / 60)).padStart(2, "0");
    const s = String(remain % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [remain]);

  // Polling backend to detect SUCCESS confirmed by webhook
  useEffect(() => {
    if (!orderId || !orderData) return;
    if (status === "success" || status === "expired") return;
    let aborted = false;
    let pollCount = 0;
    const maxPollAttempts = 100; // Giới hạn số lần poll
    
    // Format order_id đúng (VARCHAR(4))
    const formattedOrderId = String(orderId).padStart(4, '0').substring(0, 4);
    
    // Lấy customer_id từ orderData hoặc localStorage
    // Sử dụng key 'gd_user' (giống như các component khác trong app)
    let customerId = orderData?.customer_id;
    if (!customerId) {
      try {
        const userDataStr = localStorage.getItem('gd_user'); // Sửa từ 'user' thành 'gd_user'
        const role = localStorage.getItem('role');
        if (userDataStr && role === 'user') {
          const userData = JSON.parse(userDataStr);
          if (userData.id) {
            customerId = userData.id;
          }
        }
      } catch (e) {
        console.warn("💳 PaymentPage - Error getting customer_id in polling:", e);
      }
    }
    
    const iv = setInterval(async () => {
      try {
        pollCount++;
        
        // Dừng polling sau max attempts
        if (pollCount > maxPollAttempts) {
          console.warn(`[PaymentPage] Max polling attempts reached (${maxPollAttempts}), stopping...`);
          clearInterval(iv);
          return;
        }
        
        // Build query với order_id đã format và customer_id nếu có
        let queryUrl = `/transactions?order_id=${formattedOrderId}&payment_status=SUCCESS`;
        if (customerId) {
          queryUrl += `&customer_id=${customerId}`;
        }
        
        console.log(`[PaymentPage] Polling transaction status (attempt ${pollCount}) for order_id=${formattedOrderId}`);
        const res = await api.get(queryUrl);
        const arr = Array.isArray(res.data) ? res.data : [];
        console.log(`[PaymentPage] Poll response:`, arr.length, "transactions found");
        
        if (!aborted && arr.length > 0) {
          console.log(`[PaymentPage] Payment confirmed! Transaction:`, arr[0]);
          setStatus("success");
          setOrderTime(new Date().toLocaleString("vi-VN"));
          setShowSuccessModal(true);
          toast("✅ Thanh toán thành công!");
          clearInterval(iv);
        }
      } catch (err) {
        console.error("[PaymentPage] Polling error:", err);
        // Nếu lỗi quá nhiều lần, dừng polling
        if (pollCount > 10 && err.response?.status >= 500) {
          console.error("[PaymentPage] Too many polling errors, stopping...");
          clearInterval(iv);
        }
      }
    }, 2000); // Giảm interval xuống 2 giây để nhanh hơn
    
    return () => { aborted = true; clearInterval(iv); };
  }, [orderId, orderData, status]);

  const toast = (msg) => {
    const el = document.createElement("div");
    el.className =
      "fixed bottom-6 right-6 bg-slate-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-[60]";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Đã copy vào clipboard");
    } catch {
      alert("Không copy được.");
    }
  };

  // Format order description - PHẢI đặt trước early return để tuân thủ Rules of Hooks
  const orderDescription = useMemo(() => {
    if (!orderData) return "—";
    try {
      const parts = [];
      if (orderData.vehicle_type) parts.push(orderData.vehicle_type);
      if (orderData.weight_kg) parts.push(`${orderData.weight_kg}kg`);
      if (orderData.pickup_address && orderData.dropoff_address) {
        parts.push(`${orderData.pickup_address} → ${orderData.dropoff_address}`);
      }
      return parts.join(", ") || "—";
    } catch {
      return "—";
    }
  }, [orderData]);

  const refresh = () => {
    setStatus("pending");
    setRemain(15 * 60);
  };

  // Sepay config state
  const [sepayConfig, setSepayConfig] = useState(null);
  const [sepayLoading, setSepayLoading] = useState(true);

  // Fetch Sepay config from backend
  useEffect(() => {
    let aborted = false;
    
    async function fetchSepayConfig() {
      try {
        setSepayLoading(true);
        const response = await api.get("/sepay/config");
        if (!aborted && response.data?.success) {
          setSepayConfig(response.data.config);
        }
      } catch (err) {
        console.error("Error fetching Sepay config:", err);
        // Fallback to demo config if API fails
        if (!aborted) {
          setSepayConfig({
            account: "5801774227",
            bank: "BIDV",
            qrTemplate: "compact",
          });
        }
      } finally {
        if (!aborted) setSepayLoading(false);
      }
    }

    fetchSepayConfig();
    return () => { aborted = true; };
  }, []);

  // Build Sepay QR URL
  const qrNote = note; // GMD-<orderCode>
  const qrUrl = useMemo(() => {
    if (!sepayConfig || sepayLoading) return "";
    
    return buildSepayQrUrl({
      acc: sepayConfig.account,
      bank: sepayConfig.bank,
      amount: payAmount && payAmount > 0 ? payAmount : undefined,
      des: qrNote,
      template: sepayConfig.qrTemplate,
    });
  }, [sepayConfig, sepayLoading, payAmount, qrNote]);

  // Early returns sau khi đã gọi tất cả hooks
  if (loading) {
    return (
      <section className="p-6 md:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </section>
    );
  }

  if (error || !orderData) {
    return (
      <section className="p-6 md:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Không tìm thấy đơn hàng"}</p>
            <button 
              onClick={() => navigate("/nhap-in4" + (orderId ? `?orderId=${orderId}` : ""))}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Trở lại trang điền thông tin
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Thanh toán QR</h1>
          <p className="text-slate-600">Quét mã để hoàn tất giao dịch an toàn, nhanh chóng.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50"
            onClick={() => navigate("/nhap-in4" + (orderId ? `?orderId=${orderId}` : ""))}
          >
            Hủy thanh toán
          </button>
          <button
            className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => navigate("/transport-companies")}
          >
            Trở về trang chủ
          </button>
          <button
            className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50"
            onClick={() => navigate("/payment-history")}
          >
            Lịch sử giao dịch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_.8fr] gap-6">
        {/* Left */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
          {/* header strip */}
          <div className="px-5 md:px-7 py-5 border-b border-slate-200"
               style={{background: "linear-gradient(150deg,#7dd3fc 0%, #e0e7ff 40%, #ffffff 100%)"}}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-grid place-items-center w-10 h-10 rounded-xl bg-white/90 ring-1 ring-slate-200">
                  <Smartphone className="w-5 h-5 text-blue-700" />
                </span>
                <div>
                  <div className="text-sm text-slate-600">Thanh toán cho</div>
                  <div className="font-bold">{provider}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">Số tiền</div>
                <div className="text-2xl font-extrabold">
                  {amount && amount > 0 ? `${VND(amount)} VNĐ` : "Đang tính..."}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-7 grid lg:grid-cols-[minmax(280px,360px)_1fr] gap-6 items-start">
            {/* QR card */}
            <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Clock className="w-4 h-4" />
                  Hết hạn trong <span className="font-semibold text-slate-900 ml-1">{mmss}</span>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> VIETQR / NAPAS 24/7
                </div>
              </div>

              <div className="rounded-xl overflow-hidden ring-1 ring-slate-200 p-3 bg-white">
                <img
                  src={qrUrl}
                  alt="QR Thanh toán Sepay"
                  className="block w-full h-auto mx-auto"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                <button
                  className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = "qr.jpg";
                    a.download = "gemadept-vietqr.jpg";
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4" />Tải QR
                </button>

                <button
                  className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
                  onClick={() => handleCopy(`VIETQR|GEMADEPT|${payAmount}|GMD-${orderCode}`)}
                >
                  <Copy className="w-4 h-4" />Copy nội dung
                </button>

                <button
                  className="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
                  onClick={refresh}
                >
                  <RefreshCw className="w-4 h-4" />Làm mới
                </button>
              </div>
              <p className="text-[12px] text-slate-500 mt-3">
                * Không chia sẻ mã QR cho người lạ. Mã sẽ tự vô hiệu khi hết thời gian.
              </p>
            </div>

            {/* Status + instructions + methods */}
            <div className="space-y-4">
              {/* Status */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Trạng thái thanh toán</h3>
                  {status === "pending" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">Đang chờ</span>
                  )}
                  {status === "success" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Thành công</span>
                  )}
                  {status === "expired" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200">Hết hạn</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  {status === "pending" && (<Loader className="w-4 h-4 animate-spin" />)}
                  {status === "success" && (<Check className="w-4 h-4 text-emerald-600" />)}
                  {status === "expired" && (<XCircle className="w-4 h-4 text-rose-600" />)}
                  <div>
                    {status === "pending" && "Hệ thống đang chờ nhận tiền từ ngân hàng."}
                    {status === "success" && "Đã nhận tiền. Đang phát hành e-invoice…"}
                    {status === "expired" && <>Mã QR đã hết hạn, hãy bấm <b>Làm mới</b> để tạo lại.</>}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-2.5">
                    <div className="text-[11px] text-slate-500">Mã đơn</div>
                    <div
                      className="font-mono font-semibold text-[12px] md:text-[13px] leading-6 overflow-x-auto whitespace-nowrap"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {orderCode}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-2.5">
                    <div className="text-[11px] text-slate-500">Thời gian</div>
                    <div className="font-semibold">{orderTime}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-2.5">
                    <div className="text-[11px] text-slate-500">Kênh</div>
                    <div className="font-semibold">MoMo / Banking</div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold mb-2">Hướng dẫn nhanh</h3>
                <ol className="list-decimal pl-5 text-sm space-y-1 text-slate-700">
                  <li>Mở <span className="font-medium">MoMo</span> hoặc app ngân hàng (Vietcombank, Techcombank, v.v.).</li>
                  <li>Chọn <span className="font-medium">Quét QR</span> và đưa camera vào vùng mã.</li>
                  <li>Kiểm tra đúng <span className="font-medium">tên người nhận: {provider}</span> và số tiền.</li>
                  <li>Xác nhận và hoàn tất. Hệ thống sẽ tự động cập nhật trạng thái.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <OrderDetails
          provider={provider}
          amount={amount || 0}
          orderCode={orderCode}
          note={note}
          orderDescription={orderDescription}
          vehicleType={orderData?.vehicle_type}
          pickupAddress={orderData?.pickup_address}
          dropoffAddress={orderData?.dropoff_address}
          onCopy={(t) => {
            try {
              navigator.clipboard.writeText(t);
              toast("Đã copy vào clipboard");
            } catch {
              alert("Không copy được.");
            }
          }}
        />
      </div>

      {/* Success Modal */}
      {showSuccessModal && status === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Thanh toán thành công!</h3>
                  <p className="text-sm text-slate-600">Giao dịch của bạn đã được xác nhận</p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-slate-500 mb-1">Mã đơn hàng</div>
                    <div className="font-mono font-semibold">{orderCode}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1">Số tiền</div>
                    <div className="font-semibold text-emerald-600">{VND(amount)} VNĐ</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-slate-500 mb-1">Thời gian</div>
                    <div className="font-semibold">{orderTime}</div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 text-center">
                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/transport-companies");
                }}
                className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Về trang chủ
              </button>
              
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/payment-history");
                }}
                className="w-full h-12 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <History className="w-5 h-5" />
                Xem lịch sử giao dịch
              </button>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full h-10 rounded-xl text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
