import { Helmet } from "react-helmet-async";
import Navbar from "../components/landing/navbar";

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
      </div>
    </>
  );
};

export default HomePage;
