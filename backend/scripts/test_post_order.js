async function main() {
  const payload = {
    company_id: 1,
    vehicle_id: 156,
    customer_id: "53614b49-6d97-430f-a717-2581abb43b05",
    cargo_name: "test",
    cargo_type: "food",
    weight_kg: 121,
    volume_m3: 1.77,
    value_vnd: 1038000,
    declared_value_vnd: 12000000,
    require_cold: true,
    require_danger: false,
    require_loading: false,
    require_insurance: false,
    pickup_address: "ffff",
    dropoff_address: "Kho Cần Thơ - 456 Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều, Cần Thơ",
    pickup_time: null,
    note: "note",
    contact_name: "Test",
    contact_phone: "01234",
    recipient_name: "Receiver",
    recipient_phone: "0999",
  };

  try {
    const res = await fetch("http://localhost:5001/api/cargo-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("Error status:", res.status);
      console.error("Error data:", data);
    } else {
      console.log("Success", data);
    }
  } catch (err) {
    console.error("Error message:", err.message);
  }
}

main();

