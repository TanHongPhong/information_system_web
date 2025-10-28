import React, { useState } from "react";
import Sidebar from "../components/user/Sidebar";
import Topbar from "../components/user/Topbar";
import CompanyDirectory from "../components/companies/CompanyDirectory";

export default function App() {
  const [keyword, setKeyword] = useState("");
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <Sidebar />
      <Topbar />
      <main className="ml-20 pt-[72px]">
        <CompanyDirectory keyword={keyword} />
      </main>
    </div>
  );
}
