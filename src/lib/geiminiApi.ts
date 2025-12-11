import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export const generateBlueprintResponse = async (
  input: string | { name: string; industry: string; role: string; stage: string }
) => {
  try {
    const userPrompt =
      typeof input === "string"
        ? input
        : `Create a comprehensive project blueprint for a startup with the following details:
           Name: ${input.name}
           Industry: ${input.industry}
           User Role: ${input.role}
           Stage: ${input.stage}
           
           Please include:
           1. Executive Summary
           2. Core Features (MVP)
           3. User Personas (Target Audience)
           4. Technical Stack Recommendations (Frontend, Backend, Database)
           5. First 30-Day Roadmap`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: userPrompt,
      config: {
        systemInstruction: `You are an expert Blueprint Architect for SprintPilot. 
        Your goal is to generate detailed, structured, and professional project blueprints.
        
        Provide the response in the following Markdown format:
        
        ## Project Name: [Creative Name]
        
        ### Executive Summary
        [Brief overview of the project]
        
        ### Core Features
        - [Feature 1]: [Description]
        - [Feature 2]: [Description]
        - [Feature 3]: [Description]
        
        ### User Personas
        1. **[Persona Name]**: [Description & Goals]
        2. **[Persona Name]**: [Description & Goals]
        
        ### Technical Stack Recommendations
        - Frontend: [Suggestion]
        - Backend: [Suggestion]
        - Database: [Suggestion]
        
        ### First 30-Day Roadmap
        - Week 1: [Tasks]
        - Week 2: [Tasks]
        - Week 3: [Tasks]
        - Week 4: [Tasks]
        
        Keep the tone professional, encouraging, and productive.`,
      },
    });

    return result.text;
  } catch (error) {
    console.error("Error generating blueprint:", error);
    return "I apologize, but I encountered an error while generating your blueprint. Please try again later.";
  }
};

export const generatePRDResponse = async (
  section: string,
  context?: string
) => {
  try {
    const systemInstruction = `You are an expert Product Manager and PRD (Product Requirements Document) architect.
Your goal is to generate detailed, structured, and professional PRD sections based on the user's request.

When a user asks for a specific PRD section, provide a response in the following comprehensive Markdown format:

For PROBLEM STATEMENT:
## Problem Statement
### The Core Problem
[Clearly define the fundamental problem]

### Current Challenges
- [Challenge 1]: [Description & impact]
- [Challenge 2]: [Description & impact]
- [Challenge 3]: [Description & impact]

### Target Audience Affected
- [Primary audience]: [How they're affected]
- [Secondary audience]: [How they're affected]

### Business Impact
[Quantitative and qualitative impact of not solving this problem]

### Success Metrics
| Metric | Current State | Target | Timeline |
|--------|--------------|--------|----------|
| [Metric 1] | [Current] | [Target] | [When] |
| [Metric 2] | [Current] | [Target] | [When] |

For VISION & GOALS:
## Vision & Goals
### Long-term Vision
[Inspiring vision statement - 3-5 years]

### Product Vision
[Specific product vision - 1-2 years]

### SMART Goals
#### Strategic Goals
1. **[Goal 1]**: [Specific, Measurable, Achievable, Relevant, Time-bound]
   - **Success Criteria**: [How to measure]
   - **Key Results**: [Quantifiable outcomes]

#### Tactical Goals
1. **[Tactical Goal 1]**: [Specific actions]
   - **Owner**: [Team/Person]
   - **Deadline**: [Date]

### North Star Metric
[Single most important metric that indicates success]

For USER SEGMENTS:
## User Segments
### Primary User Personas
#### [Persona Name]
- **Demographics**: [Age, Role, Location]
- **Goals**: [Primary objectives]
- **Pain Points**: [Current frustrations]
- **Tech Savviness**: [Level of technical expertise]
- **Key Behaviors**: [Usage patterns]

### Secondary User Personas
[Similar structure as above]

### User Stories
As a [user type], I want to [action] so that [benefit].

### User Journey Map
| Stage | Action | Emotion | Opportunity |
|-------|--------|---------|-------------|
| [Stage 1] | [Action] | [Feeling] | [Improvement] |

For FUNCTIONAL REQUIREMENTS:
## Functional Requirements
### Core Features
#### [Feature Name] - Priority: [P0/P1/P2]
- **Description**: [Detailed feature description]
- **User Flow**: [Step-by-step user interaction]
- **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
- **Dependencies**: [Other features/systems required]
- **Technical Considerations**: [Technical implications]

### Feature Matrix
| Feature | Priority | Complexity | Est. Time | Dependencies |
|---------|----------|------------|-----------|--------------|
| [Feature] | [P0/1/2] | [High/Med/Low] | [Weeks] | [Dependencies] |

For NON-FUNCTIONAL REQUIREMENTS:
## Non-Functional Requirements
### Performance Requirements
- **Response Time**: [Max acceptable response times]
- **Throughput**: [Requests per second]
- **Load Handling**: [Concurrent users]

### Security Requirements
- [Security requirement 1]
- [Security requirement 2]
- [Security requirement 3]

### Scalability Requirements
- [Scalability targets and constraints]

### Reliability & Availability
- **Uptime**: [Percentage target]
- **MTTR**: [Mean Time to Recovery]
- **Backup Strategy**: [Data backup approach]

### Accessibility
- [WCAG compliance level]
- [Specific accessibility requirements]

### Compliance
- [Industry standards and regulations]

For EDGE CASES & RISKS:
## Edge Cases & Risks
### Identified Risks
#### [Risk Name] - Severity: [High/Medium/Low]
- **Description**: [What could go wrong]
- **Probability**: [Likelihood percentage]
- **Impact**: [Consequences if it occurs]
- **Mitigation Strategy**: [How to prevent/reduce]
- **Contingency Plan**: [What to do if it happens]

### Edge Cases
#### [Edge Case Scenario]
- **Scenario**: [Specific unusual condition]
- **Expected Behavior**: [How system should handle]
- **Implementation Notes**: [Technical considerations]

### Dependencies & Assumptions
- [Critical external dependencies]
- [Key assumptions being made]

General Guidelines:
1. Always use proper Markdown formatting
2. Include tables for structured data
3. Use bullet points for lists
4. Include specific, actionable items
5. Add realistic metrics and timelines
6. Make content practical and implementable
7. Use industry-standard terminology
8. Include both business and technical perspectives

Keep the tone professional, data-driven, and actionable. If context is provided, incorporate it meaningfully.`;

    const userPrompt = context
      ? `Generate a comprehensive "${section}" section for a Product Requirements Document. Additional context: ${context}`
      : `Generate a comprehensive "${section}" section for a Product Requirements Document for a tech startup.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    return result.text;
  } catch (error) {
    console.error("Error generating PRD section:", error);
    return `# ${section}\n\n## Error Generating Content\n\nWe encountered an issue while generating this section. Please try again or manually write your content.\n\nError: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
  }
};

export const generateCompletePRD = async (productDescription: string) => {
  try {
    const systemInstruction = `You are an expert Product Manager. Generate a complete, comprehensive Product Requirements Document based on the user's product description.

Generate ALL sections in this exact order with comprehensive content:

1. PROBLEM STATEMENT
2. VISION & GOALS  
3. USER SEGMENTS
4. FUNCTIONAL REQUIREMENTS
5. NON-FUNCTIONAL REQUIREMENTS
6. EDGE CASES & RISKS

Each section should be detailed, actionable, and professionally formatted with Markdown. Include tables, lists, and specific metrics where appropriate.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: `Generate a complete PRD for: ${productDescription}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return result.text;
  } catch (error) {
    console.error("Error generating complete PRD:", error);
    throw new Error("Failed to generate complete PRD");
  }
};

export interface GeneratedTask {
  title: string;
  description: string;
  status: "backlog" | "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  assignee?: string;
  tags: string[];
}

export const generateTasks = async (
  prompt: string
): Promise<GeneratedTask[]> => {
  try {
    const systemInstruction = `You are an expert Project Manager and Task Breakdown Specialist for SprintPilot.
Your goal is to generate a comprehensive list of development tasks based on the user's project description or feature request.

IMPORTANT: You MUST respond with ONLY a valid JSON array. No markdown, no explanations, no code blocks - just pure JSON.

The JSON format should be an array of task objects, each with the following structure:
{
  "title": "Task title (clear and actionable)",
  "description": "Detailed description of what needs to be done",
  "status": "backlog" | "todo" | "in_progress" | "done",
  "priority": "low" | "medium" | "high",
  "assignee": "Optional: Initials or short name (max 10 chars, or omit if not applicable)",
  "tags": ["Tag1", "Tag2", "Tag3"]
}

Guidelines:
1. Generate 5-15 tasks depending on the complexity of the request
2. Break down the work into logical, actionable tasks
3. Use appropriate status: most should be "backlog" or "todo", only mark as "in_progress" or "done" if explicitly mentioned
4. Assign priority based on task importance: "high" for critical/core features, "medium" for important features, "low" for nice-to-haves
5. Tags should be relevant (e.g., "Frontend", "Backend", "API", "UI", "Database", "Testing", "Core", "Feature")
6. Assignee can be omitted if not applicable
7. Make descriptions clear and actionable
8. Tasks should be in a logical order (dependencies first)

Example valid response:
[{"title":"Set up authentication system","description":"Implement user registration and login with email/password and OAuth providers","status":"backlog","priority":"high","tags":["Backend","Core","Security"]},{"title":"Design login UI components","description":"Create responsive login and registration forms with validation","status":"backlog","priority":"high","assignee":"UI","tags":["Frontend","UI","Design"]}]

Remember: Return ONLY the JSON array, nothing else.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: `Generate development tasks for: ${prompt}`,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });

    const responseText = (result.text || "").trim();

    if (!responseText) {
      throw new Error("No response received from AI");
    }

    let jsonText = responseText;

    if (responseText.startsWith("```")) {
      jsonText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    jsonText = jsonText.trim();

    const tasks = JSON.parse(jsonText) as GeneratedTask[];

    return tasks.map((task) => ({
      title: task.title || "Untitled Task",
      description: task.description || "",
      status: (["backlog", "todo", "in_progress", "done"].includes(task.status)
        ? task.status
        : "backlog") as "backlog" | "todo" | "in_progress" | "done",
      priority: (["low", "medium", "high"].includes(task.priority)
        ? task.priority
        : "medium") as "low" | "medium" | "high",
      assignee:
        task.assignee && task.assignee.length <= 10 ? task.assignee : undefined,
      tags: Array.isArray(task.tags)
        ? task.tags.filter((tag) => typeof tag === "string")
        : [],
    }));
  } catch (error) {
    console.error("Error generating tasks:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to generate tasks: ${error.message}`
        : "Failed to generate tasks. Please try again."
    );
  }
};

export interface WireframeElement {
  id: string;
  type: "rect" | "circle" | "text" | "image" | "line" | "frame";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color?: string;
  content?: string;
  rotation?: number;
  opacity?: number;
}

export interface WireframeContent {
  elements: WireframeElement[];
  zoom: number;
  backgroundColor?: string;
  name?: string;
}

export const generateWireframeFromPRD = async (
  prdContent: string,
  prdTitle: string
): Promise<WireframeContent> => {
  try {
    const systemInstruction = `You are an expert UI/UX designer and wireframe architect for SprintPilot.
Your goal is to generate a detailed wireframe layout structure based on a PRD (Product Requirements Document).

IMPORTANT: You MUST respond with ONLY a valid JSON object. No markdown, no explanations, no code blocks - just pure JSON.

The JSON format should be:
{
  "elements": [
    {
      "id": "unique-id",
      "type": "rect|circle|text|image|line|frame",
      "x": number (pixel position from left),
      "y": number (pixel position from top),
      "width": number (in pixels),
      "height": number (in pixels),
      "label": "Element name/purpose",
      "color": "bg-color-class (optional)",
      "content": "text content (optional)",
      "rotation": 0,
      "opacity": 1
    }
  ],
  "zoom": 100,
  "backgroundColor": "bg-color-class (optional)",
  "name": "Wireframe name"
}

Guidelines for wireframe generation:
1. Create a comprehensive layout for the main user interface described in the PRD
2. Use realistic positioning and sizing
3. Include key sections: Header/Navigation, Hero/Main Content, Features, CTA Buttons, Footer
4. Use frame elements (type: "frame") to group related components
5. Color suggestions: 
   - Headers/Navigation: "bg-primary/20"
   - Important sections: "bg-blue-100"
   - Secondary sections: "bg-gray-100"
   - CTAs: "bg-primary/30"
   - Backgrounds: "bg-white"
6. Make the wireframe responsive-ready (use proportional dimensions)
7. Include labels that describe each element's purpose
8. Create a mobile-friendly layout if mobile is mentioned in the PRD
9. Element IDs should be unique and descriptive (e.g., "header-1", "cta-button", "feature-section")
10. Base layout on 1280px width for desktop, 375px for mobile views

Example structure:
{
  "elements": [
    {"id":"frame-main","type":"frame","x":0,"y":0,"width":1280,"height":1600,"label":"Main Container","color":"bg-white"},
    {"id":"header","type":"rect","x":0,"y":0,"width":1280,"height":80,"label":"Header/Navigation","color":"bg-primary/20"}
  ],
  "zoom": 100,
  "name": "Desktop Layout"
}

Remember: Return ONLY the JSON object, nothing else. Make the wireframe detailed and realistic.`;

    const userPrompt = `Generate a professional wireframe layout for a product based on this PRD content:

Title: ${prdTitle}

Content:
${prdContent.substring(0, 2000)}

Create a complete, professional wireframe that represents the main user interface and user flows described in this PRD. Include all major sections and components.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });

    const responseText = (result.text || "").trim();

    if (!responseText) {
      throw new Error("No response received from AI");
    }

    let jsonText = responseText;

    if (responseText.startsWith("```")) {
      jsonText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    jsonText = jsonText.trim();

    const wireframe = JSON.parse(jsonText) as WireframeContent;

    // Validate the response structure
    if (!wireframe.elements || !Array.isArray(wireframe.elements)) {
      throw new Error("Invalid wireframe structure");
    }

    return {
      elements: wireframe.elements || [],
      zoom: wireframe.zoom || 100,
      backgroundColor: wireframe.backgroundColor || "bg-white",
      name: wireframe.name || "Generated Wireframe",
    };
  } catch (error) {
    console.error("Error generating wireframe from PRD:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to generate wireframe: ${error.message}`
        : "Failed to generate wireframe. Please try again."
    );
  }
};

export interface GeneratedRoadmapFeature {
  title: string;
  description: string;
  status: "now" | "next" | "later";
  priority: "Low" | "Medium" | "High";
  tags: string[];
}

export const generateRoadmapSuggestions = async (
  context: string
): Promise<GeneratedRoadmapFeature[]> => {
  try {
    const systemInstruction = `You are an expert Product Manager for SprintPilot.
Your goal is to generate a strategic product roadmap based on the user's project context.

IMPORTANT: You MUST respond with ONLY a valid JSON array. No markdown, no explanations, no code blocks - just pure JSON.

The JSON format should be an array of objects:
[
  {
    "title": "Feature Title",
    "description": "Brief description",
    "status": "now" | "next" | "later",
    "priority": "Low" | "Medium" | "High",
    "tags": ["Tag1", "Tag2"]
  }
]

Guidelines:
1. "now": Critical core features needed immediately.
2. "next": Important features for the near term.
3. "later": Future enhancements and nice-to-haves.
4. Generate 6-12 items distributed across the statuses.
5. Be specific and actionable.
6. Return ONLY the JSON array.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: `Generate a product roadmap for: ${context}`,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });

    const responseText = (result.text || "").trim();

    if (!responseText) {
      throw new Error("No response received from AI");
    }

    let jsonText = responseText;

    if (responseText.startsWith("```")) {
      jsonText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    const features = JSON.parse(jsonText) as GeneratedRoadmapFeature[];

    return features.map((f) => ({
      ...f,
      status: (["now", "next", "later"].includes(f.status)
        ? f.status
        : "later") as "now" | "next" | "later",
      priority: (["Low", "Medium", "High"].includes(f.priority)
        ? f.priority
        : "Medium") as "Low" | "Medium" | "High",
      tags: Array.isArray(f.tags) ? f.tags : [],
    }));
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw new Error("Failed to generate roadmap suggestions");
  }
};
