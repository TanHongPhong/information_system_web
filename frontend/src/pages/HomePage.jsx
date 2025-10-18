import GlobalStyles from "../components/home/GlobalStyles";
import GlobalBackground from "../components/home/GlobalBackground";
import TopNoticeBar from "../components/home/TopNoticeBar";
import Header from "../components/home/Header";
import Hero from "../components/home/Hero";
import Fleet from "../components/home/Fleet";
import Features from "../components/home/Features";
import Routes from "../components/home/Routes";
import Pricing from "../components/home/Pricing";
import Timeline from "../components/home/TimeLine";
import Testimonials from "../components/home/Testimonials";
import FAQ from "../components/home/FAQ";
import ServicePromise from "../components/home/ServicePromise";
import Footer from "../components/home/Footer";
import MobileCTA from "../components/home/MobileCTA";

export default function App() {
  return (
    <div className="text-slate-800 font-sans">
      <GlobalStyles />
      <GlobalBackground />
      <TopNoticeBar />
      <Header />
      <main>
        <Hero />
        <Fleet />
        <Features />
        <Routes />
        <Pricing />
        <Timeline />
        <Testimonials />
        <FAQ />
        <ServicePromise />
      </main>
      <Footer />
      <MobileCTA />
    </div>
  );
}
