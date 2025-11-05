// App.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";
import VehiclePage from "../components/vehicle/VehiclePage";

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const companyId = searchParams.get("companyId");

  // Kiểm tra role và logout nếu không đúng
  useEffect(() => {
    const userData = localStorage.getItem("gd_user");
    const role = localStorage.getItem("role");

    if (!userData || role !== "user") {
      console.warn(`Access denied: Role '${role}' is not allowed for user pages`);
      logout();
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("gd_user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("remember");
    navigate("/sign-in", { replace: true });
  };
  
  return (
    <AppLayout>
      <VehiclePage keyword={keyword} companyId={companyId} />
    </AppLayout>
  );
}
