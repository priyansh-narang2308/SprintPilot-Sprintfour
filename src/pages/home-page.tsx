import { Helmet } from "react-helmet-async";
import Navbar from "../components/landing/navbar";
import Hero from "../components/landing/hero-section";
import Features from "../components/landing/feature-section";
import HowItWorks from "../components/landing/how-it-works";
import FAQ from "../components/landing/faq";
import CTA from "../components/landing/cta";
import Footer from "../components/landing/footer";

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>SprintPilot - AI Startup Blueprint Generator</title>
        <meta
          name="description"
          content="Generate PRDs, user personas, journey maps, wireframes, and roadmaps instantly. Turn your startup idea into an actionable plan in minutes."
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <FAQ />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
