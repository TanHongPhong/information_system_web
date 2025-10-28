// src/pages/SignUp.jsx
import Styles from "../components/sign in/Styles";
import NoticeBar from "../components/sign in/NoticeBar";
import Header from "../components/sign in/Header";
import SignUpForm from "../components/sign up/SignUpForm";
import RolePanel from "../components/sign in/RolePanel";
import Footer from "../components/sign in/Footer";

export default function SignUp() {
  return (
    <>
      <Styles />
      <NoticeBar />
      <Header />

      <main>
        <section className="py-10 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-6">
            <SignUpForm />
            <RolePanel />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

