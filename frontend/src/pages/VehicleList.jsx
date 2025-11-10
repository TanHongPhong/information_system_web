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

  const [originRegion, setOriginRegion] = useState(searchParams.get("origin_region") || "");
  const [destinationRegion, setDestinationRegion] = useState(searchParams.get("destination_region") || "");
  const [userId, setUserId] = useState(searchParams.get("userId") || "");

  // Log params để debug
  useEffect(() => {
    console.log("📍 VehicleList: Received params", {
      companyId,
      originRegion,
      destinationRegion,
      userId,
      allParams: Object.fromEntries(searchParams)
    });
  }, [companyId, originRegion, destinationRegion, userId, searchParams]);

  // Đồng bộ lại origin/destination/userId từ localStorage nếu không có trong URL
  useEffect(() => {
    let origin = searchParams.get("origin_region") || "";
    let destination = searchParams.get("destination_region") || "";
    let currentUserId = searchParams.get("userId") || "";

    if (!origin || !destination) {
      try {
        const savedRoute = JSON.parse(localStorage.getItem("selected_route") || "{}");
        if (!origin && savedRoute.origin_region) origin = savedRoute.origin_region;
        if (!destination && savedRoute.destination_region) destination = savedRoute.destination_region;
      } catch (error) {
        console.warn("VehicleList: Unable to parse selected_route from localStorage", error);
      }
    }

    if (!currentUserId) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("gd_user") || "{}");
        if (storedUser?.id) {
          currentUserId = storedUser.id.toString();
        }
      } catch (error) {
        console.warn("VehicleList: Unable to parse gd_user from localStorage", error);
      }
    }

    setOriginRegion(origin || "");
    setDestinationRegion(destination || "");
    setUserId(currentUserId || "");
  }, [searchParams]);

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
      <VehiclePage 
        keyword={keyword} 
        companyId={companyId}
        originRegion={originRegion}
        destinationRegion={destinationRegion}
        userId={userId}
      />
    </AppLayout>
  );
}
