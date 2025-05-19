"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  MessageSquare,
  ThumbsUp,
  Share2,
  BookmarkPlus,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMobile } from "@/hooks/use-mobile"
import { QUESTIONS, RECENT_NOTES, formatRelativeTime, CURRENT_USER } from "@/lib/mock-data"
import { STUDY_PLANS, TASKS, SESSIONS, generateId } from "@/lib/study-plan-data"
import { QuestionModal } from "@/components/question-modal"
import { Navbar } from "@/components/navbar"
import { TaskDetailsModal } from "@/components/task-details-modal"
import { saveQuestion, isItemSaved, unsaveItem } from "@/lib/saved-items-data"
import { vote, getVoteCount, getUserVote } from "@/lib/voting-data"
import { toast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const router = useRouter()
  const isMobile = useMobile()
  const [showLeftSidebar, setShowLeftSidebar] = useState(!isMobile)
  const [showRightSidebar, setShowRightSidebar] = useState(!isMobile)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false)
  const [questionVotes, setQuestionVotes] = useState({})
  const [savedQuestions, setSavedQuestions] = useState({})

  // Local state for tasks and sessions (in a real app, this would use a database)
  const [tasks, setTasks] = useState(TASKS)
  const [sessions, setSessions] = useState(SESSIONS)

  const handlePostClick = (questionId: string) => {
    router.push(`/question/${questionId}`)
  }

  const handleProfileClick = (e: React.MouseEvent, authorId: string) => {
    e.stopPropagation() // Prevent the post click event from firing
    router.push(`/profile/${authorId}`)
  }

  const handleVote = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation() // Prevent the post click event from firing

    // Toggle vote
    const currentVote = getUserVote(CURRENT_USER.id, questionId)
    const newVote = currentVote === "up" ? null : "up"

    vote(CURRENT_USER.id, questionId, "question", "up")

    // Update local state
    setQuestionVotes({
      ...questionVotes,
      [questionId]: getVoteCount(questionId),
    })

    // Show toast
    if (newVote === "up") {
      toast({
        title: "Upvoted",
        description: "You've upvoted this question",
      })
    } else {
      toast({
        title: "Vote removed",
        description: "You've removed your vote from this question",
      })
    }
  }

  const handleSaveQuestion = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation() // Prevent the post click event from firing

    const isSaved = isItemSaved(CURRENT_USER.id, questionId)

    if (isSaved) {
      unsaveItem(CURRENT_USER.id, questionId)
      setSavedQuestions({
        ...savedQuestions,
        [questionId]: false,
      })
      toast({
        title: "Unsaved",
        description: "Question removed from your saved items",
      })
    } else {
      saveQuestion(CURRENT_USER.id, questionId)
      setSavedQuestions({
        ...savedQuestions,
        [questionId]: true,
      })
      toast({
        title: "Saved",
        description: "Question added to your saved items",
      })
    }
  }

  const handleCopyLink = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation() // Prevent the post click event from firing

    // Create a URL for the question
    const url = `${window.location.origin}/question/${questionId}`

    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied",
        description: "Question link copied to clipboard",
      })
    })
  }

  const handleShareToSocial = (e: React.MouseEvent, platform: string, questionId: string, questionTitle: string) => {
    e.stopPropagation() // Prevent the post click event from firing

    const url = `${window.location.origin}/question/${questionId}`
    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(questionTitle)}&url=${encodeURIComponent(url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      default:
        return
    }

    window.open(shareUrl, "_blank", "width=600,height=400")
  }

  const handleActionClick = (e: React.MouseEvent, action: string, questionId: string, questionTitle?: string) => {
    e.stopPropagation() // Prevent the post click event from firing

    // Handle different actions
    switch (action) {
      case "vote":
        handleVote(e, questionId)
        break
      case "comment":
        router.push(`/question/${questionId}#comments`)
        break
      case "save":
        handleSaveQuestion(e, questionId)
        break
      default:
        break
    }
  }

  const handleQuestionSubmit = (questionData: { title: string; body: string; tags: string[] }) => {
    // In a real app, you would submit the question to an API
    console.log("Question submitted:", questionData)

    // For demo purposes, we'll show an alert
    toast({
      title: "Question posted",
      description: "Your question has been posted successfully",
    })
  }

  const openTaskDetails = (task) => {
    setSelectedTask(task)
    setIsTaskDetailsModalOpen(true)
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left Sidebar - Recent Notes */}
          {showLeftSidebar && (
            <aside className="w-full lg:w-1/4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recently Viewed Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {RECENT_NOTES.map((note) => (
                      <li key={note.id}>
                        <Link
                          href={`/notes/${note.id}`}
                          className="flex items-start gap-2 rounded-md p-2 hover:bg-slate-100"
                        >
                          <BookOpen className="mt-0.5 h-4 w-4 text-slate-500" />
                          <div>
                            <p className="font-medium text-slate-800">{note.title}</p>
                            <p className="text-xs text-slate-500">Last viewed: {note.lastViewed}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </aside>
          )}

          {/* Middle Section - QnA Feed */}
          <section className="flex-1 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div
                  className="flex items-center gap-3 rounded-md bg-slate-50 p-3 cursor-pointer hover:bg-slate-100"
                  onClick={() => setIsQuestionModalOpen(true)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={CURRENT_USER.name} />
                    <AvatarFallback>{CURRENT_USER.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-slate-500">Ask a question...</span>
                </div>
              </CardContent>
            </Card>

            {QUESTIONS.map((question) => {
              const voteCount =
                questionVotes[question.id] !== undefined ? questionVotes[question.id] : question.voteCount

              const userVote = getUserVote(CURRENT_USER.id, question.id)
              const isSaved =
                savedQuestions[question.id] !== undefined
                  ? savedQuestions[question.id]
                  : isItemSaved(CURRENT_USER.id, question.id)

              return (
                <Card
                  key={question.id}
                  className="overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => handlePostClick(question.id)}
                >
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => handleProfileClick(e, question.author?.id)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={question.author?.name} />
                            <AvatarFallback>{question.author?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium hover:underline">{question.author?.name}</p>
                            <p className="text-xs text-slate-500">{formatRelativeTime(question.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {question.isResolved && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              Resolved
                            </span>
                          )}
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                            {question.tags[0]}
                          </span>
                        </div>
                      </div>

                      <h3 className="mb-2 text-lg font-semibold">{question.title}</h3>
                      <p className="text-slate-600">{question.body}</p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {question.tags.slice(1).map((tag) => (
                          <Badge key={tag} variant="outline" className="bg-slate-100">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 ${userVote === "up" ? "text-emerald-600" : "text-slate-600"}`}
                        onClick={(e) => handleActionClick(e, "vote", question.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{voteCount}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-slate-600"
                        onClick={(e) => handleActionClick(e, "comment", question.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{question.answers?.length || 0}</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-slate-600">
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={(e) => handleCopyLink(e, question.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Copy link</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleShareToSocial(e, "facebook", question.id, question.title)}
                          >
                            <Facebook className="mr-2 h-4 w-4" />
                            <span>Share to Facebook</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleShareToSocial(e, "twitter", question.id, question.title)}
                          >
                            <Twitter className="mr-2 h-4 w-4" />
                            <span>Share to Twitter</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleShareToSocial(e, "linkedin", question.id, question.title)}
                          >
                            <Linkedin className="mr-2 h-4 w-4" />
                            <span>Share to LinkedIn</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 ${isSaved ? "text-emerald-600" : "text-slate-600"}`}
                        onClick={(e) => handleActionClick(e, "save", question.id)}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                        <span>{isSaved ? "Saved" : "Save"}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </section>

          {/* Right Sidebar - Study Plans */}
          {showRightSidebar && (
            <aside className="w-full lg:w-1/4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today&apos;s Study Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {STUDY_PLANS.map((plan) => {
                      // Find the corresponding task
                      const task = tasks.find((t) => t.id === plan.id)

                      return (
                        <Card
                          key={plan.id}
                          className="bg-gradient-to-br from-emerald-50 to-teal-50 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => task && openTaskDetails(task)}
                        >
                          <CardContent className="p-3">
                            <h3 className="font-medium text-slate-800">{plan.title}</h3>
                            <p className="text-xs text-slate-500">{plan.duration}</p>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span>
                                  {plan.completed}/{plan.total} tasks
                                </span>
                                <span>{Math.round((plan.completed / plan.total) * 100)}%</span>
                              </div>
                              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${(plan.completed / plan.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </aside>
          )}
        </div>
      </main>

      {/* Question Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onSubmit={handleQuestionSubmit}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isTaskDetailsModalOpen}
        onClose={() => setIsTaskDetailsModalOpen(false)}
        task={selectedTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onScheduleSession={handleScheduleSession}
        sessions={sessions}
      />
    </div>
  )
}
