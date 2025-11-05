import UnifiedSidebar from "./UnifiedSidebar.jsx";
import UnifiedTopbar from "./UnifiedTopbar.jsx";

export default function AppLayout({ children, className = "" }) {
  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-['Inter',ui-sans-serif,system-ui] ${className}`}>
      <UnifiedSidebar />
      <UnifiedTopbar />
      <main className="ml-20 pt-[72px]">
        {children}
      </main>
    </div>
  );
}

