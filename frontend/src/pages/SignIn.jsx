// src/pages/SignIn.jsx
import Styles from "../components/sign in/Styles";
import NoticeBar from "../components/sign in/NoticeBar";
import Header from "../components/sign in/Header";
import LoginForm from "../components/sign in/LoginForm";
import RolePanel from "../components/sign in/RolePanel";
import Footer from "../components/sign in/Footer";

export default function SignIn() {
  return (
    <>
      <Styles />
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
    </>
  );
}
