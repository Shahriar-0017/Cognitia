"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  LineChart,
  Clock3,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  getTodaysTasks,
  getCompletedTasks,
  getUpcomingTasks,
  formatTime,
  formatDate,
  getTodaysSessions,
  FOCUS_AREAS,
  WEEKLY_STUDY_DATA,
  TASKS,
  SESSIONS,
  generateId,
  MONTHLY_PROGRESS,
  SUBJECT_PROGRESS,
  STUDY_TIME_DISTRIBUTION,
  TASK_COMPLETION_RATE,
} from "@/lib/study-plan-data"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { NewTaskModal } from "@/components/new-task-modal"
import { TaskDetailsModal } from "@/components/task-details-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudyPlanPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
  const [progressTimeframe, setProgressTimeframe] = useState("weekly")
  const [expandedSection, setExpandedSection] = useState<string | null>("focus")
  const [selectedSubject, setSelectedSubject] = useState("all")

  // Local state for tasks and sessions (in a real app, this would use a database)
  const [tasks, setTasks] = useState(TASKS)
  const [sessions, setSessions] = useState(SESSIONS)

  // Get tasks for today
  const todaysTasks = getTodaysTasks()

  // Get completed tasks
  const completedTasks = getCompletedTasks()

  // Get upcoming tasks
  const upcomingTasks = getUpcomingTasks()

  // Get sessions for today
  const todaysSessions = getTodaysSessions()

  const handleCreateTask = (taskData) => {
    const newTask = {
      id: generateId(),
      ...taskData,
      userId: "user_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setTasks([...tasks, newTask])
    setIsNewTaskModalOpen(false)
  }

  const handleUpdateTask = (taskId, taskData) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          // If status changed to completed, add completedAt date
          if (taskData.status === "completed" && task.status !== "completed") {
            taskData.completedAt = new Date()
          }

          // If status changed from completed, remove completedAt date
          if (taskData.status !== "completed" && task.status === "completed") {
            taskData.completedAt = undefined
          }

          return {
            ...task,
            ...taskData,
            updatedAt: new Date(),
          }
        }
        return task
      }),
    )
  }

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId))

    // Also delete any sessions associated with this task
    setSessions(sessions.filter((session) => session.taskId !== taskId))
  }

  const handleScheduleSession = (sessionData) => {
    const newSession = {
      id: generateId(),
      ...sessionData,
      userId: "user_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setSessions([...sessions, newSession])
  }

  const openTaskDetails = (task) => {
    setSelectedTask(task)
    setIsTaskDetailsModalOpen(true)
  }

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  // Filter subject progress data based on selected subject
  const filteredSubjectProgress =
    selectedSubject === "all" ? SUBJECT_PROGRESS : SUBJECT_PROGRESS.filter((item) => item.subject === selectedSubject)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold">Study Plan</h1>
          <div className="flex gap-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsNewTaskModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Task
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? formatDate(date) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Tabs defaultValue="today">
              <TabsList className="mb-6">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todaysSessions.length > 0 ? (
                      <div className="space-y-4">
                        {todaysSessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-start gap-4 rounded-lg border p-4 hover:bg-slate-50"
                            onClick={() => {
                              const task = tasks.find((t) => t.id === session.taskId)
                              if (task) openTaskDetails(task)
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="mb-1 flex items-center justify-between">
                                <h3 className="font-medium">{session.task?.title}</h3>
                                <span className="text-sm text-slate-500">
                                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">{session.goal}</p>
                              <div className="mt-2 flex items-center">
                                <Badge variant="outline" className="mr-2 bg-emerald-50 text-emerald-700">
                                  {session.task?.subjectArea}
                                </Badge>
                                <span className="text-xs text-slate-500">{session.duration} minutes</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        <p>No sessions scheduled for today</p>
                        <Button
                          variant="link"
                          className="mt-2 text-emerald-600"
                          onClick={() => setIsNewTaskModalOpen(true)}
                        >
                          Schedule a session
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tasks Due Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todaysTasks.length > 0 ? (
                      <div className="space-y-2">
                        {todaysTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50"
                            onClick={() => openTaskDetails(task)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300">
                              <CheckCircle2 className="h-4 w-4 text-slate-300" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="bg-slate-50 text-slate-700">
                                  {task.subjectArea}
                                </Badge>
                                <span className="text-xs text-slate-500">Priority: {task.priority}</span>
                                {task.estimatedTime && (
                                  <span className="text-xs text-slate-500">{task.estimatedTime} min</span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUpdateTask(task.id, { status: "in_progress" })
                              }}
                            >
                              Start
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        <p>No tasks due today</p>
                        <Button
                          variant="link"
                          className="mt-2 text-emerald-600"
                          onClick={() => setIsNewTaskModalOpen(true)}
                        >
                          Add a task
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {upcomingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50"
                          onClick={() => openTaskDetails(task)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-slate-300" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{task.title}</h4>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline" className="bg-slate-50 text-slate-700">
                                {task.subjectArea}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                Due: {formatDate(task.dueDate, "month-day")}
                              </span>
                              <span className="text-xs text-slate-500">Priority: {task.priority}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              const task = tasks.find((t) => t.id === task.id)
                              if (task) {
                                setSelectedTask(task)
                                setIsTaskDetailsModalOpen(true)
                              }
                            }}
                          >
                            Schedule
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Completed Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {completedTasks.length > 0 ? (
                      <div className="space-y-2">
                        {completedTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 rounded-lg border p-3 hover:bg-slate-50"
                            onClick={() => openTaskDetails(task)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                              <CheckCheck className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                                  {task.subjectArea}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  Completed: {formatDate(task.completedAt!, "short")}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500">
                        <p>No completed tasks yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Progress Overview</span>
                  <Select value={progressTimeframe} onValueChange={setProgressTimeframe}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Today's Progress */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">Today&apos;s Progress</h4>
                      <span className="text-sm font-medium text-emerald-600">
                        {todaysSessions.filter((s) => s.completed).length}/{todaysSessions.length} sessions
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${
                            todaysSessions.length
                              ? (todaysSessions.filter((s) => s.completed).length / todaysSessions.length) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Weekly Progress */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">Weekly Progress</h4>
                      <span className="text-sm font-medium text-emerald-600">
                        {completedTasks.length}/{completedTasks.length + todaysTasks.length + upcomingTasks.length}{" "}
                        tasks
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${
                            completedTasks.length + todaysTasks.length + upcomingTasks.length
                              ? (
                                  completedTasks.length /
                                    (completedTasks.length + todaysTasks.length + upcomingTasks.length)
                                ) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Monthly Progress */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">Monthly Progress</h4>
                      <span className="text-sm font-medium text-emerald-600">
                        {MONTHLY_PROGRESS[MONTHLY_PROGRESS.length - 1].completed}/
                        {MONTHLY_PROGRESS[MONTHLY_PROGRESS.length - 1].total} tasks
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${
                            (MONTHLY_PROGRESS[MONTHLY_PROGRESS.length - 1].completed /
                              MONTHLY_PROGRESS[MONTHLY_PROGRESS.length - 1].total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Study Time This Week */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">Study Time This Week</h4>
                      <button
                        onClick={() => toggleSection("study-time")}
                        className="text-emerald-600 hover:text-emerald-700 focus:outline-none"
                      >
                        {expandedSection === "study-time" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {WEEKLY_STUDY_DATA.map((day, i) => (
                        <div key={i} className="text-center">
                          <div
                            className="mx-auto mb-1 h-16 w-4 rounded-full bg-emerald-100"
                            style={{
                              height: `${Math.max(20, day.hours * 16)}px`,
                              backgroundColor: i === 3 ? "rgb(16 185 129)" : "", // Highlight today (Thursday)
                            }}
                          ></div>
                          <span className="text-xs">{day.day.charAt(0)}</span>
                        </div>
                      ))}
                    </div>

                    {expandedSection === "study-time" && (
                      <div className="mt-4 rounded-lg bg-slate-50 p-3">
                        <h5 className="mb-2 text-sm font-medium">Total Study Hours</h5>
                        <div className="flex items-center justify-between text-sm">
                          <span>This Week</span>
                          <span className="font-medium">
                            {WEEKLY_STUDY_DATA.reduce((total, day) => total + day.hours, 0).toFixed(1)} hours
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span>Daily Average</span>
                          <span className="font-medium">
                            {(WEEKLY_STUDY_DATA.reduce((total, day) => total + day.hours, 0) / 7).toFixed(1)} hours
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs text-slate-600">
                            Most productive day:{" "}
                            {
                              WEEKLY_STUDY_DATA.reduce(
                                (max, day) => (day.hours > max.hours ? day : max),
                                WEEKLY_STUDY_DATA[0],
                              ).day
                            }
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Focus Areas */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">Focus Areas</h4>
                      <button
                        onClick={() => toggleSection("focus")}
                        className="text-emerald-600 hover:text-emerald-700 focus:outline-none"
                      >
                        {expandedSection === "focus" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {FOCUS_AREAS.map((area, index) => (
                        <div key={index}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span>{area.subject}</span>
                            <span>{area.percentage}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full bg-emerald-500" style={{ width: `${area.percentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {expandedSection === "focus" && (
                      <div className="mt-4 space-y-3">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-emerald-600" />
                            <h5 className="text-sm font-medium">Study Time Distribution</h5>
                          </div>
                          <div className="space-y-2">
                            {STUDY_TIME_DISTRIBUTION.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <span>{item.subject}</span>
                                <span>
                                  {item.hours} hours ({item.percentage}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-emerald-600" />
                            <h5 className="text-sm font-medium">Task Completion Rate</h5>
                          </div>
                          <div className="space-y-2">
                            {TASK_COMPLETION_RATE.map((item, index) => (
                              <div key={index}>
                                <div className="flex items-center justify-between text-xs">
                                  <span>{item.priority} Priority</span>
                                  <span>{item.completed}%</span>
                                </div>
                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className="h-full"
                                    style={{
                                      width: `${item.completed}%`,
                                      backgroundColor:
                                        item.priority === "High"
                                          ? "#ef4444"
                                          : item.priority === "Medium"
                                            ? "#f59e0b"
                                            : "#3b82f6",
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <LineChart className="h-4 w-4 text-emerald-600" />
                            <h5 className="text-sm font-medium">Subject Progress</h5>
                          </div>
                          <div className="mb-2">
                            <Select value={selectedSubject} onValueChange={setSelectedSubject} className="w-full">
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Subjects</SelectItem>
                                {SUBJECT_PROGRESS.map((item, index) => (
                                  <SelectItem key={index} value={item.subject}>
                                    {item.subject}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3">
                            {filteredSubjectProgress.map((subject, index) => (
                              <div key={index}>
                                <h6 className="text-xs font-medium">{subject.subject}</h6>
                                <div className="mt-1 flex items-end justify-between gap-1">
                                  {subject.data.map((week, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                      <div
                                        className="w-4 rounded-sm bg-emerald-200"
                                        style={{
                                          height: `${week.score * 0.8}px`,
                                          backgroundColor: i === subject.data.length - 1 ? "#10b981" : "#a7f3d0",
                                        }}
                                      ></div>
                                      <span className="mt-1 text-[10px] text-slate-500">{week.week.split(" ")[1]}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleCreateTask}
      />

      <TaskDetailsModal
        isOpen={isTaskDetailsModalOpen}
        onClose={() => setIsTaskDetailsModalOpen(false)}
        task={selectedTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onScheduleSession={handleScheduleSession}
        sessions={sessions}
        hideCloseButton={true}
      />
    </div>
  )
}
