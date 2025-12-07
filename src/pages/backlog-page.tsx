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
  Filter,
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

    const stored = localStorage.getItem("current_workspace")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSelectedWorkspace(parsed)
      } catch (e) {
        console.error("Failed to parse workspace", e)
      }
    }
  }, [])

  useEffect(() => {
    if (user && selectedWorkspace) {
      fetchTasks()
    } else if (user && !selectedWorkspace) {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedWorkspace])

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
    setDeletingTaskId(task.id)
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", task.id)

      if (error) throw error

      toast.success("Task completed and removed")
      await fetchTasks()
    } catch (err) {
      console.error("Failed to complete task", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to complete task"
      toast.error(errorMessage)
    } finally {
      setDeletingTaskId(null)
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
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="w-4 h-4 mr-2" />
              Export to Jira
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
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
                {status === "all" ? "All" : status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
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

                    return (
                      <tr
                        key={task.id}
                        className={cn(
                          "border-b border-border/50 hover:bg-muted/50 transition-all group",
                          isDeleting && "opacity-50"
                        )}
                      >
                        <td className="p-3 sm:p-4">
                          <Checkbox
                            checked={false}
                            onCheckedChange={() => handleCheckboxComplete(task)}
                            disabled={isDeleting}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="p-3 sm:p-4">
                          <p className={cn("font-medium text-xs sm:text-sm", isDeleting && "line-through text-muted-foreground")}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className={cn("text-xs text-muted-foreground mt-0.5 line-clamp-1", isDeleting && "line-through")}>
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
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
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

      {/* Delete Confirmation Dialog */}
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
    </DashboardLayout>
  )
}

export default BacklogPage
