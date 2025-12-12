<div align="center">
  <h1>SprintPilot</h1>
  <p><strong>The Ultimate Agile Product Management Workspace</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

**SprintPilot** is a cutting-edge, all-in-one platform engineered to supercharge product teams. By integrating powerful planning tools with modern design and AI capabilities, SprintPilot transforms how you manage backlogs, build roadmaps, and define product requirements. Experience a workspace that isn't just functional—it's inspiring.

## ✨ Features

### 🎯 Core Product Management
- **Smart Dashboard**: A command center providing a real-time, comprehensive view of your projects, recent activities, and key insights.
- **Dynamic Roadmaps**: Visualize your product strategy with interactive, drag-and-drop roadmaps. Plan releases, prioritize features, and seamless drag-and-drop functionality using `@dnd-kit`.
- **Intelligent Backlog**: Organize, groom, and prioritize your user stories and tasks with efficiency.
- **PRD Builder**: Craft detailed Product Requirements Documents using structured templates and rich text editing.

### 🧠 Strategic Tools
- **Deep User Personas**: Create empathetic, detailed user personas to keep your team user-centric.
- **Competitive Analysis**: Systematically track and analyze competitors to identify market gaps and opportunities.
- **Visual Wireframing**: Sketch out ideas and user flows directly within the application.
- **AI-Powered Insights**: Leverage built-in **Gemini AI** integration ("Hootsy") for intelligent content generation, roadmap suggestions, and instant feedback.

### 💎 UX & Design
- **Premium Aesthetics**: A stunning, modern interface featuring glassmorphism, vibrant color palettes, and a dark-mode-first approach.
- **Fluid Animations**: Smooth, engaging transitions and micro-interactions powered by **Framer Motion**.
- **Responsive Design**: Flawlessly optimized for all screen sizes.

## 🛠️ Tech Stack

SprintPilot is built with a modern, robust, and scalable technology stack:

- **Frontend**: [React 18](https://reactjs.org/) (TypeScript)
- **Build System**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with `tailwindcss-animate`
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (shadcn/ui), [Lucide Icons](https://lucide.dev/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **AI Engine**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Form Handling**: React Hook Form + Zod

## 🚀 Getting Started

Follow these steps to set up SprintPilot locally:

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/priyansh-narang2308/sprintpilot.git
    cd sprintpilot
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory. You will need to configure your Supabase and Gemini API credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5174](http://localhost:5174) to view it in the browser.

## 🤝 Contributing

We welcome contributions! visual improvements, bug fixes, or new features—everything helps make SprintPilot better.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
