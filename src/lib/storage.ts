export interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  lastEdited: string;
  modules: string[];
  blueprintContent?: string;
}

export interface Activity {
  action: string;
  project: string;
  time: string;
  timestamp: number; // For sorting
}

const STORAGE_KEYS = {
  PROJECTS: "sprintpilot_projects",
  ACTIVITY: "sprintpilot_activity",
};

export const storage = {
  getProjects: (): Project[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || "[]");
    } catch {
      return [];
    }
  },

  addProject: (project: Project) => {
    const projects = storage.getProjects();
    const updated = [project, ...projects];
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
    return updated;
  },

  getActivities: (): Activity[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || "[]");
    } catch {
      return [];
    }
  },

  logActivity: (action: string, projectName: string) => {
    const activities = storage.getActivities();
    const newActivity: Activity = {
      action,
      project: projectName,
      time: "Just now",
      timestamp: Date.now(),
    };
    // Keep last 50 activities
    const updated = [newActivity, ...activities].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(updated));
    return updated;
  },

  // Helper to format "Just now", "2 hours ago" etc. (Optional enhancement)
  // For now we keep "Just now" and rely on UI refreshes or simple strings.
};
