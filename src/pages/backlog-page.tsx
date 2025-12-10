import { useState, useEffect } from 'react'
import DashboardLayout from '../components/dashboard/dashboard-layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Checkbox } from '../components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  Wand2,
  Loader2,
  Trash2,
  Edit,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import { cn } from '../lib/utils'
import { generateTasks, type GeneratedTask } from '../lib/geiminiApi'
import { createJiraIssue, testJiraConnection, type JiraConfig } from '../lib/jiraApi'

type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done'
type TaskPriority = 'low' | 'medium' | 'high'

interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee: string | null
  tags: string[]
  created_at: string
  updated_at: string
  workspace_id: string
}

const statusConfig = {
  backlog: { label: "Backlog", icon: Circle, color: "text-muted-foreground" },
  todo: { label: "To Do", icon: AlertCircle, color: "text-chart-3" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-primary" },
  done: { label: "Done", icon: CheckCircle2, color: "text-chart-4" },
};

const BacklogPage = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TaskStatus | 'all'>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<{ id: string; name: string } | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generatingTasks, setGeneratingTasks] = useState(false)
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([])
  const [selectedTaskIndices, setSelectedTaskIndices] = useState<Set<number>>(new Set())
  const [creatingTasks, setCreatingTasks] = useState(false)
  const [jiraModalOpen, setJiraModalOpen] = useState(false)
  const [jiraConfig, setJiraConfig] = useState<JiraConfig>({
    domain: '',
    email: '',
    apiToken: '',
    projectKey: '',
  })
  const [testingConnection, setTestingConnection] = useState(false)
  const [exportingToJira, setExportingToJira] = useState(false)
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 })
  const [exportResults, setExportResults] = useState<Array<{ task: Task; success: boolean; jiraKey?: string; error?: string }>>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'backlog' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee: '',
    tags: '' as string,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadWorkspace = () => {
      const stored = localStorage.getItem("current_workspace")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setSelectedWorkspace(parsed)
        } catch (e) {
          console.error("Failed to parse workspace", e)
        }
      }
    }

    loadWorkspace()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'current_workspace') {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue)
            setSelectedWorkspace(parsed)
            setTasks([])
          } catch (e) {
            console.error("Failed to parse workspace", e)
          }
        } else {
          setSelectedWorkspace(null)
          setTasks([])
        }
      }
    }

    const handleWorkspaceChange = () => {
      const stored = localStorage.getItem("current_workspace")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setSelectedWorkspace(parsed)
          setTasks([])
        } catch (e) {
          console.error("Failed to parse workspace", e)
        }
      } else {
        setSelectedWorkspace(null)
        setTasks([])
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('workspace-changed', handleWorkspaceChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('workspace-changed', handleWorkspaceChange)
    }
  }, [])

  useEffect(() => {
    if (user && selectedWorkspace) {
      fetchTasks()
    } else if (user && !selectedWorkspace) {
      setTasks([])
      setLoading(false)
    } else {
      setTasks([])
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedWorkspace?.id])

  const fetchTasks = async () => {
    if (!user || !selectedWorkspace) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("workspace_id", selectedWorkspace.id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setTasks((data as Task[]) || [])
    } catch (err) {
      console.error("Failed to fetch tasks", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load tasks"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (formData.assignee && formData.assignee.length > 10) {
      newErrors.assignee = "Assignee name must be 10 characters or less"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (editingTaskId) {
      await handleUpdateTask()
      return
    }

    if (!user || !selectedWorkspace) {
      toast.error("Please select a workspace")
      return
    }

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const { error } = await supabase
        .from("tasks")
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          status: formData.status,
          priority: formData.priority,
          assignee: formData.assignee.trim() || null,
          tags: tagsArray,
          workspace_id: selectedWorkspace.id,
          user_id: user.id,
        })

      if (error) throw error

      toast.success("Task created successfully")
      setModalOpen(false)
      resetForm()
      await fetchTasks()
    } catch (err) {
      console.error("Failed to create task", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create task"
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'backlog',
      priority: 'medium',
      assignee: '',
      tags: '',
    })
    setErrors({})
    setEditingTaskId(null)
  }

  const handleOpenModal = () => {
    if (!selectedWorkspace) {
      toast.error("Please select a workspace first")
      return
    }
    resetForm()
    setEditingTaskId(null)
    setModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignee: task.assignee || '',
      tags: task.tags?.join(', ') || '',
    })
    setEditingTaskId(task.id)
    setModalOpen(true)
  }

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return

    setDeletingTaskId(taskToDelete.id)
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskToDelete.id)

      if (error) throw error

      toast.success("Task deleted successfully")
      await fetchTasks()
    } catch (err) {
      console.error("Failed to delete task", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete task"
      toast.error(errorMessage)
    } finally {
      setDeletingTaskId(null)
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  const handleCheckboxComplete = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done'

    setUpdatingTaskId(task.id)
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", task.id)

      if (error) throw error

      toast.success(newStatus === 'done' ? "Task marked as done!" : "Task reopened")
      await fetchTasks()
    } catch (err) {
      console.error("Failed to update task status", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update task"
      toast.error(errorMessage)
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const handleGenerateTasks = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt to generate tasks")
      return
    }

    if (!selectedWorkspace) {
      toast.error("Please select a workspace first")
      return
    }

    setGeneratingTasks(true)
    setGeneratedTasks([])
    setSelectedTaskIndices(new Set())

    try {
      const tasks = await generateTasks(aiPrompt)
      setGeneratedTasks(tasks)

      setSelectedTaskIndices(new Set(tasks.map((_, index) => index)))
      toast.success(`Generated ${tasks.length} tasks! Review and select which ones to add.`)
    } catch (err) {
      console.error("Failed to generate tasks", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to generate tasks"
      toast.error(errorMessage)
    } finally {
      setGeneratingTasks(false)
    }
  }

  const handleToggleTaskSelection = (index: number) => {
    const newSelected = new Set(selectedTaskIndices)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedTaskIndices(newSelected)
  }

  const handleSelectAllTasks = () => {
    if (selectedTaskIndices.size === generatedTasks.length) {
      setSelectedTaskIndices(new Set())
    } else {
      setSelectedTaskIndices(new Set(generatedTasks.map((_, index) => index)))
    }
  }

  const handleCreateSelectedTasks = async () => {
    if (!user || !selectedWorkspace) {
      toast.error("Missing required information")
      return
    }

    if (selectedTaskIndices.size === 0) {
      toast.error("Please select at least one task to create")
      return
    }

    setCreatingTasks(true)
    try {
      const tasksToCreate = generatedTasks.filter((_, index) => selectedTaskIndices.has(index))

      const tasksData = tasksToCreate.map(task => ({
        title: task.title.trim(),
        description: task.description.trim() || null,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee?.trim() || null,
        tags: task.tags || [],
        workspace_id: selectedWorkspace.id,
        user_id: user.id,
      }))

      const { error } = await supabase
        .from("tasks")
        .insert(tasksData)

      if (error) throw error

      toast.success(`Successfully created ${tasksToCreate.length} task(s)!`)
      setAiModalOpen(false)
      setAiPrompt('')
      setGeneratedTasks([])
      setSelectedTaskIndices(new Set())
      await fetchTasks()
    } catch (err) {
      console.error("Failed to create tasks", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create tasks"
      toast.error(errorMessage)
    } finally {
      setCreatingTasks(false)
    }
  }

  const handleTestJiraConnection = async () => {
    if (!jiraConfig.domain || !jiraConfig.email || !jiraConfig.apiToken || !jiraConfig.projectKey) {
      toast.error("Please fill in all Jira configuration fields")
      return
    }

    setTestingConnection(true)
    try {
      const isValid = await testJiraConnection(jiraConfig)
      if (isValid) {
        toast.success("Jira connection successful!")
        // Save config to localStorage
        localStorage.setItem('jira_config', JSON.stringify(jiraConfig))
      } else {
        toast.error("Failed to connect to Jira. Please check your credentials.")
      }
    } catch (err) {
      console.error("Jira connection test failed", err)
      const errorMessage = err instanceof Error ? err.message : "Connection test failed"
      toast.error(errorMessage)
    } finally {
      setTestingConnection(false)
    }
  }

  const handleExportToJira = async () => {
    if (!jiraConfig.domain || !jiraConfig.email || !jiraConfig.apiToken || !jiraConfig.projectKey) {
      toast.error("Please configure Jira settings first")
      return
    }


    const tasksToExport = filteredTasks.length > 0 ? filteredTasks : tasks

    if (tasksToExport.length === 0) {
      toast.error("No tasks to export")
      return
    }

    setExportingToJira(true)
    setExportProgress({ current: 0, total: tasksToExport.length })
    setExportResults([])

    const results: Array<{ task: Task; success: boolean; jiraKey?: string; error?: string }> = []

    try {

      const isValid = await testJiraConnection(jiraConfig)
      if (!isValid) {
        throw new Error("Jira connection failed. Please check your credentials.")
      }


      localStorage.setItem('jira_config', JSON.stringify(jiraConfig))


      for (let i = 0; i < tasksToExport.length; i++) {
        const task = tasksToExport[i]
        setExportProgress({ current: i + 1, total: tasksToExport.length })

        try {
          const jiraIssue = await createJiraIssue(jiraConfig, {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignee: task.assignee,
            tags: task.tags,
          })

          results.push({
            task,
            success: true,
            jiraKey: jiraIssue.key,
          })
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error"
          results.push({
            task,
            success: false,
            error: errorMessage,
          })
        }


        if (i < tasksToExport.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      setExportResults(results)
      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      if (successCount > 0) {
        toast.success(`Successfully exported ${successCount} task(s) to Jira!`)
      }
      if (failCount > 0) {
        toast.error(`${failCount} task(s) failed to export. Check details below.`)
      }
    } catch (err) {
      console.error("Export to Jira failed", err)
      const errorMessage = err instanceof Error ? err.message : "Export failed"
      toast.error(errorMessage)
    } finally {
      setExportingToJira(false)
    }
  }

  const handleUpdateTask = async () => {
    if (!user || !selectedWorkspace || !editingTaskId) {
      toast.error("Missing required information")
      return
    }

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const { error } = await supabase
        .from("tasks")
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          status: formData.status,
          priority: formData.priority,
          assignee: formData.assignee.trim() || null,
          tags: tagsArray,
        })
        .eq("id", editingTaskId)

      if (error) throw error

      toast.success("Task updated successfully")
      setModalOpen(false)
      resetForm()
      setEditingTaskId(null)
      await fetchTasks()
    } catch (err) {
      console.error("Failed to update task", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update task"
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter !== "all" && task.status !== filter) return false
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(task.description?.toLowerCase().includes(searchQuery.toLowerCase()))) return false
    return true
  })

  const taskCounts = {
    all: tasks.length,
    backlog: tasks.filter(t => t.status === "backlog").length,
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    done: tasks.filter(t => t.status === "done").length,
  }

  if (!selectedWorkspace) {
    return (
      <DashboardLayout title="Backlog">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Please select a workspace to view tasks</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Backlog">
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Product Backlog</h1>
            <p className="text-muted-foreground text-sm">Manage your development tasks</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => {
              // Load saved config from localStorage
              const saved = localStorage.getItem('jira_config')
              if (saved) {
                try {
                  setJiraConfig(JSON.parse(saved))
                } catch (e) {
                  console.error('Failed to load Jira config', e)
                }
              }
              setJiraModalOpen(true)
            }}>
              <Download className="w-4 h-4 mr-2" />
              Export to Jira
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => setAiModalOpen(true)}>
              <Wand2 className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
            <Button variant="hero" size="sm" onClick={handleOpenModal}>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted rounded-xl p-1 overflow-x-auto">
            {Object.entries(taskCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilter(status as TaskStatus | 'all')}
                className={cn(
                  "px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                  filter === status
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {status === "all"
                  ? "All"
                  : status === "done"
                    ? "Done"
                    : status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                <span className="ml-1.5 text-xs opacity-60">{count}</span>
              </button>
            ))}
          </div>


        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? "No tasks found matching your search" : "No tasks yet. Create your first task!"}
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm w-10"></th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm">Task</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm">Status</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm">Priority</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm">Assignee</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm">Tags</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const statusColor = statusConfig[task.status].color
                    const isDeleting = deletingTaskId === task.id
                    const isUpdating = updatingTaskId === task.id
                    const isDone = task.status === 'done'

                    return (
                      <tr
                        key={task.id}
                        className={cn(
                          "border-b border-border/50 hover:bg-muted/50 transition-all group",
                          (isDeleting || isUpdating) && "opacity-50",
                          isDone && "bg-muted/20"
                        )}
                      >
                        <td className="p-3 sm:p-4">
                          <Checkbox
                            checked={isDone}
                            onCheckedChange={() => handleCheckboxComplete(task)}
                            disabled={isDeleting || isUpdating}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="p-3 sm:p-4">
                          <p className={cn(
                            "font-medium text-xs sm:text-sm transition-all",
                            isDone && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className={cn(
                              "text-xs text-muted-foreground mt-0.5 line-clamp-1 transition-all",
                              isDone && "line-through"
                            )}>
                              {task.description}
                            </p>
                          )}
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className={cn("text-xs sm:text-sm", statusColor)}>
                            {statusConfig[task.status].label}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            task.priority === "high"
                              ? "bg-destructive/10 text-destructive"
                              : task.priority === "medium"
                                ? "bg-chart-3/10 text-chart-3"
                                : "bg-muted text-muted-foreground"
                          )}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          {task.assignee ? (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                              {task.assignee.substring(0, 2).toUpperCase()}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {task.tags && task.tags.length > 0 ? (
                              task.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="px-1.5 sm:px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                            {task.tags && task.tags.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{task.tags.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                                disabled={isDeleting || isUpdating}
                              >
                                {(isDeleting || isUpdating) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="w-4 h-4" />
                                )}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditTask(task)}
                                className="cursor-pointer"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(task)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => {
        setModalOpen(open)
        if (!open) {
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTaskId ? "Edit Task" : "Add New Task"}</DialogTitle>
            <DialogDescription>
              {editingTaskId ? "Update task details below." : "Create a new task for your backlog. All fields marked with * are required."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value })
                  if (errors.title) setErrors({ ...errors, title: '' })
                }}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>


            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter task description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div className="space-y-2">
                <Label htmlFor="priority">
                  Priority <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                placeholder="Enter assignee name or initials (max 10 chars)"
                value={formData.assignee}
                onChange={(e) => {
                  setFormData({ ...formData, assignee: e.target.value })
                  if (errors.assignee) setErrors({ ...errors, assignee: '' })
                }}
                maxLength={10}
                className={errors.assignee ? "border-destructive" : ""}
              />
              {errors.assignee && (
                <p className="text-xs text-destructive">{errors.assignee}</p>
              )}
              <p className="text-xs text-muted-foreground">Enter initials or short name (e.g., "SC", "John")</p>
            </div>


            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Enter tags separated by commas (e.g., Backend, Core, UI)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Separate multiple tags with commas</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false)
                resetForm()
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingTaskId ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {editingTaskId ? (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Task
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingTaskId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletingTaskId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingTaskId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={aiModalOpen} onOpenChange={(open) => {
        setAiModalOpen(open)
        if (!open) {
          setAiPrompt('')
          setGeneratedTasks([])
          setSelectedTaskIndices(new Set())
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              AI Generate Tasks
            </DialogTitle>
            <DialogDescription>
              Describe your project or feature, and AI will generate a comprehensive task breakdown for you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">
                Project Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="ai-prompt"
                placeholder="e.g., Build a user authentication system with email/password and OAuth login, password reset functionality, and user profile management..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                disabled={generatingTasks || creatingTasks}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about features, requirements, and scope for better task generation.
              </p>
            </div>

            {generatedTasks.length === 0 && (
              <Button
                onClick={handleGenerateTasks}
                disabled={!aiPrompt.trim() || generatingTasks}
                variant="hero"
                className="w-full"
              >
                {generatingTasks ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Tasks...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Tasks
                  </>
                )}
              </Button>
            )}

            {generatedTasks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Generated Tasks ({generatedTasks.length})</h3>
                    <p className="text-sm text-muted-foreground">
                      Select the tasks you want to add to your backlog
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllTasks}
                  >
                    {selectedTaskIndices.size === generatedTasks.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {generatedTasks.map((task, index) => {
                    const isSelected = selectedTaskIndices.has(index)
                    const statusColor = statusConfig[task.status].color

                    return (
                      <div
                        key={index}
                        className={cn(
                          "border rounded-lg p-4 transition-all cursor-pointer hover:bg-muted/50",
                          isSelected && "border-primary bg-primary/5"
                        )}
                        onClick={() => handleToggleTaskSelection(index)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleTaskSelection(index)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className={cn("font-medium text-sm", isSelected && "text-primary")}>
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn("text-xs px-2 py-0.5 rounded", statusColor)}>
                                {statusConfig[task.status].label}
                              </span>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded",
                                task.priority === "high"
                                  ? "bg-destructive/10 text-destructive"
                                  : task.priority === "medium"
                                    ? "bg-chart-3/10 text-chart-3"
                                    : "bg-muted text-muted-foreground"
                              )}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                              {task.assignee && (
                                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                  {task.assignee}
                                </span>
                              )}
                              {task.tags.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {task.tags.map((tag, tagIndex) => (
                                    <span key={tagIndex} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    {selectedTaskIndices.size} of {generatedTasks.length} tasks selected
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAiPrompt('')
                        setGeneratedTasks([])
                        setSelectedTaskIndices(new Set())
                      }}
                      disabled={creatingTasks}
                    >
                      Generate New
                    </Button>
                    <Button
                      variant="hero"
                      onClick={handleCreateSelectedTasks}
                      disabled={selectedTaskIndices.size === 0 || creatingTasks}
                    >
                      {creatingTasks ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create {selectedTaskIndices.size} Task{selectedTaskIndices.size !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAiModalOpen(false)
                setAiPrompt('')
                setGeneratedTasks([])
                setSelectedTaskIndices(new Set())
              }}
              disabled={generatingTasks || creatingTasks}
            >
              {generatedTasks.length > 0 ? 'Cancel' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Jira Export Modal */}
      <Dialog open={jiraModalOpen} onOpenChange={(open) => {
        setJiraModalOpen(open)
        if (!open) {
          setExportResults([])
          setExportProgress({ current: 0, total: 0 })
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export to Jira
            </DialogTitle>
            <DialogDescription>
              Configure your Jira settings and export tasks to your Jira project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">

            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-sm">Jira Configuration</h3>

              <div className="space-y-2">
                <Label htmlFor="jira-domain">
                  Jira Domain <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="jira-domain"
                  placeholder="yourcompany.atlassian.net"
                  value={jiraConfig.domain}
                  onChange={(e) => setJiraConfig({ ...jiraConfig, domain: e.target.value })}
                  disabled={exportingToJira}
                />
                <p className="text-xs text-muted-foreground">
                  Your Jira domain (e.g., company.atlassian.net)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jira-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="jira-email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={jiraConfig.email}
                  onChange={(e) => setJiraConfig({ ...jiraConfig, email: e.target.value })}
                  disabled={exportingToJira}
                />
                <p className="text-xs text-muted-foreground">
                  Your Jira account email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jira-token">
                  API Token <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="jira-token"
                  type="password"
                  placeholder="Enter your Jira API token"
                  value={jiraConfig.apiToken}
                  onChange={(e) => setJiraConfig({ ...jiraConfig, apiToken: e.target.value })}
                  disabled={exportingToJira}
                />
                <p className="text-xs text-muted-foreground">
                  <a
                    href="https://id.atlassian.com/manage-profile/security/api-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Create an API token
                  </a>
                  {' '}in your Atlassian account settings
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jira-project">
                  Project Key <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="jira-project"
                  placeholder="PROJ"
                  value={jiraConfig.projectKey}
                  onChange={(e) => setJiraConfig({ ...jiraConfig, projectKey: e.target.value.toUpperCase() })}
                  disabled={exportingToJira}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Your Jira project key (e.g., PROJ, DEV, TASK)
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleTestJiraConnection}
                disabled={testingConnection || exportingToJira || !jiraConfig.domain || !jiraConfig.email || !jiraConfig.apiToken || !jiraConfig.projectKey}
                className="w-full"
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    Test Connection
                  </>
                )}
              </Button>
            </div>


            {exportResults.length === 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Export Tasks</h3>
                    <p className="text-sm text-muted-foreground">
                      {filteredTasks.length} task(s) will be exported to Jira
                    </p>
                  </div>
                </div>

                {exportingToJira && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Exporting tasks...</span>
                      <span>{exportProgress.current} / {exportProgress.total}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}


            {exportResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Export Results</h3>
                    <p className="text-sm text-muted-foreground">
                      {exportResults.filter(r => r.success).length} succeeded, {exportResults.filter(r => !r.success).length} failed
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                  {exportResults.map((result, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start justify-between p-3 rounded-lg border",
                        result.success ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                      )}
                    >
                      <div className="flex-1">
                        <p className={cn("text-sm font-medium", result.success ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100")}>
                          {result.task.title}
                        </p>
                        {result.success && result.jiraKey && (
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                            Created as: {result.jiraKey}
                          </p>
                        )}
                        {!result.success && result.error && (
                          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            Error: {result.error}
                          </p>
                        )}
                      </div>
                      {result.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setJiraModalOpen(false)
                setExportResults([])
                setExportProgress({ current: 0, total: 0 })
              }}
              disabled={exportingToJira}
            >
              Close
            </Button>
            {exportResults.length === 0 && (
              <Button
                variant="hero"
                onClick={handleExportToJira}
                disabled={exportingToJira || !jiraConfig.domain || !jiraConfig.email || !jiraConfig.apiToken || !jiraConfig.projectKey || filteredTasks.length === 0}
              >
                {exportingToJira ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export {filteredTasks.length} Task{filteredTasks.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

export default BacklogPage
