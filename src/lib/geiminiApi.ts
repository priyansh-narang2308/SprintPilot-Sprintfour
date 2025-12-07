import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export const generateBlueprintResponse = async (userPrompt: string) => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: userPrompt,
      config: {
        systemInstruction: `You are an expert Blueprint Architect for SprintPilot. 
        Your goal is to generate detailed, structured, and professional project blueprints based on the user's request.
        
        When a user asks for a blueprint (or any project advice), provide a response in the following Markdown format:
        
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
        
        Keep the tone professional, encouraging, and productive. If the user's request is vague, ask clarifying questions but still provide a preliminary blueprint concept.`,
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
    return `# ${section}\n\n## Error Generating Content\n\nWe encountered an issue while generating this section. Please try again or manually write your content.\n\nError: ${error instanceof Error ? error.message : "Unknown error"
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
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  tags: string[];
}

export const generateTasks = async (prompt: string): Promise<GeneratedTask[]> => {
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

    const responseText = (result.text || '').trim();

    if (!responseText) {
      throw new Error("No response received from AI");
    }


    let jsonText = responseText;


    if (responseText.startsWith('```')) {
      jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    jsonText = jsonText.trim();

    const tasks = JSON.parse(jsonText) as GeneratedTask[];


    return tasks.map(task => ({
      title: task.title || 'Untitled Task',
      description: task.description || '',
      status: (['backlog', 'todo', 'in_progress', 'done'].includes(task.status)
        ? task.status
        : 'backlog') as 'backlog' | 'todo' | 'in_progress' | 'done',
      priority: (['low', 'medium', 'high'].includes(task.priority)
        ? task.priority
        : 'medium') as 'low' | 'medium' | 'high',
      assignee: task.assignee && task.assignee.length <= 10 ? task.assignee : undefined,
      tags: Array.isArray(task.tags) ? task.tags.filter(tag => typeof tag === 'string') : [],
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
