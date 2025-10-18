import LoginGlobalStyles from "../components/login/LoginGlobalStyles";
import NoticeBar from "../components/login/NoticeBar";
import Header from "../components/login/Header";
import LoginForm from "../components/login/LoginForm";
import RolePanel from "../components/login/RolePanel";
import Footer from "../components/login/Footer";

export default function SignIn() {
  return (
    <div className="text-slate-800 font-sans bg-white">
      <LoginGlobalStyles />

      <NoticeBar />
      <Header />

      <main>
        <section className="py-10 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-6">
            <LoginForm />
            <RolePanel />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
