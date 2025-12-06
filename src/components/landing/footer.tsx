import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-8 border-t border-gray-300 dark:border-gray-700">
      <div className="container mx-auto text-center px-4">
        <Link to="/" className="text-xl font-semibold mb-2 inline-block">
          SprintPilot
        </Link>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          AI-powered startup blueprint generator. Turn your ideas into actionable plans.
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} SprintPilot. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
