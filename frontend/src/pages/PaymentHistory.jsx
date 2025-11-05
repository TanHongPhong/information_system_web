// src/pages/PaymentHistory.jsx
import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout.jsx";
import { KpiCards } from "../components/history/KpiCards.jsx";
import { FilterBar } from "../components/history/FilterBar.jsx";
import { PaymentTable } from "../components/history/PaymentTable.jsx";
import api from "../lib/axios";

// ==== Helpers (inline, không cần helpers.js) ====
const fmtVND = (v) =>
  v.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const toDate = (dmy) => {
  const [d, m, y] = dmy.split("/").map(Number);
  return new Date(y, m - 1, d);
};

// Map backend -> table row
function mapTxnToRow(t) {
  const statusMap = {
    SUCCESS: "Paid",
    PENDING: "Pending",
    FAILED: "Pending",
    CANCELLED: "Refunded",
    REFUNDED: "Refunded",
  };
  const dt = t.paid_at || t.created_at;
  const d = dt ? new Date(dt) : new Date();
  const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  const methodStr = t.payment_method || "Chuyển khoản";
  return {
    id: `#${t.order_id ?? t.transaction_id}`,
    date: dateStr,
    amount: Number(t.amount) || 0,
    company: t.company_name || "—",
    method: methodStr,
    status: statusMap[t.payment_status] || "Paid",
  };
}

export default function PaymentHistory() {
  const [filters, setFilters] = useState({ q:"", company:"", status:"", sortBy:"date_desc" });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm logout
  const logout = () => {
    localStorage.removeItem("gd_user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("remember");
    window.location.href = "/sign-in";
  };

  // Kiểm tra role và logout nếu không đúng
  useEffect(() => {
    const userData = localStorage.getItem("gd_user");
    const role = localStorage.getItem("role");

    if (!userData || role !== "user") {
      console.warn(`Access denied: Role '${role}' is not allowed for user pages`);
      logout();
    }
  }, []);

  useEffect(() => {
    let aborted = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        
        // Lấy customer_id từ localStorage
        let customerId = null;
        try {
          const userData = localStorage.getItem("gd_user");
          if (userData) {
            const user = JSON.parse(userData);
            const role = localStorage.getItem("role");
            if (role === "user" && user.id) {
              customerId = user.id;
            }
          }
        } catch (err) {
          console.error("Error getting customer_id:", err);
        }

        // Lấy giao dịch thành công của customer này
        let url = `/transactions?payment_status=SUCCESS`;
        if (customerId) {
          url += `&customer_id=${customerId}`;
        }
        
        const res = await api.get(url);
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map(mapTxnToRow);
        if (!aborted) setRows(mapped);
        
        // Debug log
        console.log("PaymentHistory - customerId:", customerId);
        console.log("PaymentHistory - transactions found:", data.length);
      } catch (err) {
        console.error("PaymentHistory error:", err);
        if (!aborted) setError("Không thể tải lịch sử thanh toán");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    return () => { aborted = true; };
  }, []);

  const filtered = useMemo(() => {
    let arr = [...rows];

    // Tìm kiếm
    if (filters.q) {
      const q = filters.q.toLowerCase().trim();
      const qNum = q.replace(/[^\d]/g, "");
      arr = arr.filter(
        (x) =>
          x.id.toLowerCase().includes(q) ||
          x.company.toLowerCase().includes(q) ||
          (qNum && String(x.amount).includes(qNum))
      );
    }

    // Lọc theo công ty
    if (filters.company) {
      arr = arr.filter((x) => x.company === filters.company);
    }

    // Lọc theo trạng thái
    if (filters.status) {
      arr = arr.filter((x) => x.status === filters.status);
    }

    // Sắp xếp
    arr.sort((a, b) => {
      switch (filters.sortBy) {
        case "date_asc": return toDate(a.date) - toDate(b.date);
        case "date_desc": return toDate(b.date) - toDate(a.date);
        case "amount_asc": return a.amount - b.amount;
        case "amount_desc": return b.amount - a.amount;
        default: return 0;
      }
    });
    
    return arr;
  }, [filters, rows]);

  // KPIs
  const kpi = useMemo(() => {
    const total = filtered.reduce((s, x) => s + x.amount, 0);
    const count = filtered.length;
    const avg = count ? total / count : 0;
    const refunded = filtered.filter((x) => x.status === "Refunded").reduce((s, x) => s + x.amount, 0);
    const now = new Date();
    const thisMonth = filtered
      .filter((x) => {
        const d = toDate(x.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, x) => s + x.amount, 0);
    return { total, count, avg, refunded, thisMonth };
  }, [filtered]);


  return (
    <AppLayout>
      <div className="px-4 md:px-6 py-6 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-soft p-5 md:p-7">
            <h2 className="text-[34px] md:text-[40px] leading-none font-extrabold text-blue-800 mb-5">
              Payment History
            </h2>
            <KpiCards
              total={kpi.total}
              count={kpi.count}
              avg={kpi.avg}
              refunded={kpi.refunded}
              thisMonth={kpi.thisMonth}
              fmt={fmtVND}
            />
          </section>

          <FilterBar onChange={(f) => { setFilters(f); }} rows={rows} />

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-soft p-8 text-center text-slate-500">
              Đang tải lịch sử thanh toán...
            </div>
          ) : error ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-soft p-8 text-center text-red-500">
              {error}
            </div>
          ) : (
            <PaymentTable
              rows={filtered}
              totalCount={filtered.length}
              fmt={fmtVND}
            />
          )}
        </div>
    </AppLayout>
  );
}
