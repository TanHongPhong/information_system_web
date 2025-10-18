import GlobalBackground from "../components/tai xe/GlobalBackground";
import Header from "../components/tai xe/Header";
import PlateRoute from "../components/tai xe/PlateRoute";
import CargoOverview from "../components/tai xe/CargoOverview";
import ActionSuggestions from "../components/tai xe/ActionSuggestions";
import OrdersDetail from "../components/tai xe/OrdersDetail";
import FooterMini from "../components/tai xe/FooterMini";

export default function App() {
  return (
    <div className="font-sans text-slate-800 antialiased selection:bg-brand-100 selection:text-slate-900">
      <GlobalBackground />
      <div className="mx-auto max-w-sm min-h-svh flex flex-col">
        <Header />
        <main className="flex-1 px-4 py-4 space-y-4">
          <PlateRoute />
          <CargoOverview />
          <ActionSuggestions />
          <OrdersDetail />
        </main>
        <FooterMini />
      </div>
    </div>
  );
}
