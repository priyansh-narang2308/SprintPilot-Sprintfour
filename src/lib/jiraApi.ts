export interface JiraConfig {
    domain: string; // e.g., "yourcompany.atlassian.net"
    email: string;
    apiToken: string;
    projectKey: string; // e.g., "PROJ"
}

export interface JiraIssue {
    fields: {
        project: {
            key: string;
        };
        summary: string;
        description?: string;
        issuetype: {
            name: string;
        };
        priority?: {
            name: string;
        };
        labels?: string[];
        assignee?: {
            accountId?: string;
            emailAddress?: string;
        };
    };
}

export interface JiraIssueResponse {
    id: string;
    key: string;
    self: string;
}

const mapPriorityToJira = (priority: 'low' | 'medium' | 'high'): string => {
    const mapping = {
        low: 'Lowest',
        medium: 'Medium',
        high: 'Highest',
    };
    return mapping[priority] || 'Medium';
};

// Map our status to Jira status (for initial creation, Jira defaults to "To Do")
const mapStatusToJira = (status: string): string => {
    const mapping = {
        backlog: 'To Do',
        todo: 'To Do',
        in_progress: 'In Progress',
        done: 'Done',
    };
    return mapping[status as keyof typeof mapping] || 'To Do';
};

// Create a Jira issue
export const createJiraIssue = async (
    config: JiraConfig,
    task: {
        title: string;
        description: string | null;
        status: string;
        priority: 'low' | 'medium' | 'high';
        assignee: string | null;
        tags: string[];
    }
): Promise<JiraIssueResponse> => {
    const baseUrl = `https://${config.domain}`;
    const auth = btoa(`${config.email}:${config.apiToken}`);

    const issue: JiraIssue = {
        fields: {
            project: {
                key: config.projectKey,
            },
            summary: task.title,
            description: task.description || undefined,
            issuetype: {
                name: 'Task', // Default to Task, can be changed
            },
            priority: {
                name: mapPriorityToJira(task.priority),
            },
            labels: task.tags.length > 0 ? task.tags : undefined,
        },
    };


    const response = await fetch(`${baseUrl}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(issue),
    });

    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to create Jira issue: ${response.status} ${response.statusText}`;

        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.errorMessages?.join(', ') || errorJson.message || errorMessage;
        } catch {
            errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
    }

    return await response.json();
};

export const testJiraConnection = async (config: JiraConfig): Promise<boolean> => {
    try {
        const baseUrl = `https://${config.domain}`;
        const auth = btoa(`${config.email}:${config.apiToken}`);

        const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return false;
        }

        const projectResponse = await fetch(`${baseUrl}/rest/api/3/project/${config.projectKey}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
            },
        });

        return projectResponse.ok;
    } catch (error) {
        console.error('Jira connection test failed:', error);
        return false;
    }
};

export const getJiraProject = async (config: JiraConfig) => {
    try {
        const baseUrl = `https://${config.domain}`;
        const auth = btoa(`${config.email}:${config.apiToken}`);

        const response = await fetch(`${baseUrl}/rest/api/3/project/${config.projectKey}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch project: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to get Jira project:', error);
        throw error;
    }
};

