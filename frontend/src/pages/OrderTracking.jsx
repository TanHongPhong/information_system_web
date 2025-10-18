import OrderSearchPanel from "../components/tracking/OrderSearchPanel";
import ShipmentMapCard from "../components/tracking/ShipmentMapCard";
import StatusTimelineCard from "../components/tracking/StatusTimelineCard";
import VehicleDetailsCard from "../components/tracking/VehicleDetailsCard";

export default function TrackOrdersPage() {
  return (
    <main className="p-4 grid grid-cols-12 gap-4">
      {/* LEFT */}
      <section className="col-span-12 lg:col-span-3">
        <OrderSearchPanel />
      </section>

      {/* CENTER */}
      <section className="col-span-12 lg:col-span-6">
        <ShipmentMapCard />
      </section>

      {/* RIGHT */}
      <section className="col-span-12 lg:col-span-3 space-y-4">
        <StatusTimelineCard
          progress={0.6}
          route={["TP.HCM", "Quảng Ngãi", "Thanh Hóa", "Hà Nội"]}
        />
        <VehicleDetailsCard />
      </section>
    </main>
  );
}
