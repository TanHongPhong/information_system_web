import React from "react";
import NoticeBar from "../components/login/NoticeBar";
import HeaderBrand from "../components/login/HeaderBrand";
import LoginForm from "../components/login/LoginForm";
import RoleAccessPanel from "../components/login/RoleAccessPanel";
import BrandFooter from "../components/login/BrandFooter";
import LoginLocalStyles from "../components/login/LoginLocalStyles";

export default function LoginPage() {
  return (
    <div className="text-slate-800 font-sans">
      <LoginLocalStyles />

      <NoticeBar />
      <HeaderBrand />

      <main>
        <section className="py-10 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-6">
            <LoginForm />
            <RoleAccessPanel />
          </div>
        </section>
      </main>

      <BrandFooter />
    </div>
  );
}
