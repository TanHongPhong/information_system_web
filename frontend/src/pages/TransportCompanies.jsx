import React, { useState } from "react";
import Sidebar from "../components/companies/Sidebar";
import HeaderBar from "../components/companies/HeaderBar";
import CompanyDirectory from "../components/companies/CompanyDirectory";

export default function App() {
  const [keyword, setKeyword] = useState("");
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <Sidebar />
      <main className="ml-20">
        <HeaderBar keyword={keyword} onKeywordChange={setKeyword} />
        <CompanyDirectory keyword={keyword} />
      </main>
    </div>
  );
}
