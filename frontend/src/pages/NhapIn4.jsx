// App.jsx
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";
import CargoPage from "../components/nhap_in4/CargoPage";

export default function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const companyId = searchParams.get("companyId");
  const vehicleId = searchParams.get("vehicleId");
  const originRegion = searchParams.get("origin_region");
  const destinationRegion = searchParams.get("destination_region");

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
      <CargoPage 
        companyId={companyId} 
        vehicleId={vehicleId}
        originRegion={originRegion}
        destinationRegion={destinationRegion}
      />
    </AppLayout>
  );
}
