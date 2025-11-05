import React, { useState } from "react";
import AppLayout from "../components/layout/AppLayout.jsx";
import CompanyDirectory from "../components/companies/CompanyDirectory";

export default function App() {
  const [keyword, setKeyword] = useState("");
  return (
    <AppLayout>
      <CompanyDirectory keyword={keyword} />
    </AppLayout>
  );
}
