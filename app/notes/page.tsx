"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, FolderPlus, Eye, EyeOff, MoreHorizontal } from "lucide-react"
import { NOTES_GROUPS, NOTES, formatRelativeTime, GLOBAL_NOTES } from "@/lib/mock-data"
import { NotesFilterControls } from "@/components/notes-filter-controls"
import { GlobalNoteCard } from "@/components/global-note-card"
import { StarRating } from "@/components/star-rating"
import { MyNotesFilter } from "@/components/my-notes-filter"
import { NewGroupModal } from "@/components/new-group-modal"
import { NewNoteModal } from "@/components/new-note-modal"
import { Navbar } from "@/components/navbar"

// Extract all unique tags from notes
const extractTags = () => {
  const allTags = new Set<string>()

  // Add tags from note titles and group names as a simple simulation
  NOTES.forEach((note) => {
    const words = note.title.split(" ")
    words.forEach((word) => {
      if (word.length > 3) {
        allTags.add(word)
      }
    })
  })

  NOTES_GROUPS.forEach((group) => {
    allTags.add(group.name)
  })

  return Array.from(allTags)
}

export default function NotesPage() {
  // State for My Notes section
  const [myNotesSearchTerm, setMyNotesSearchTerm] = useState("")
  const [mySortBy, setMySortBy] = useState("recent-edit")
  const [mySortOrder, setMySortOrder] = useState<"asc" | "desc">("desc")
  const [myTags, setMyTags] = useState<string[]>(extractTags())
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // State for modals
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false)
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false)

  // State for Global Notes section
  const [globalNotesSearchTerm, setGlobalNotesSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterBy, setFilterBy] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [activeSection, setActiveSection] = useState<"my-notes" | "global-notes">("my-notes")

  // State for recent notes (combined from my notes and global notes)
  const [recentlyViewedNotes, setRecentlyViewedNotes] = useState<any[]>([])

  // Simulate recently viewed notes on component mount
  useEffect(() => {
    // Combine and sort notes by last viewed time (most recent first)
    const combinedNotes = [
      ...NOTES.map((note) => ({
        ...note,
        source: "my",
        lastViewed: note.updatedAt,
        groupName: NOTES_GROUPS.find((g) => g.id === note.notesGroupId)?.name,
      })),
      ...GLOBAL_NOTES.map((note) => ({
        ...note,
        source: "global",
        lastViewed: note.updatedAt,
      })),
    ].sort((a, b) => b.lastViewed.getTime() - a.lastViewed.getTime())

    // Take only the 12 most recent
    setRecentlyViewedNotes(combinedNotes.slice(0, 12))
  }, [])

  // Filter and sort my notes
  const filteredMyNotes = useMemo(() => {
    let result = [...NOTES]

    // Apply search filter
    if (myNotesSearchTerm) {
      result = result.filter((note) => note.title.toLowerCase().includes(myNotesSearchTerm.toLowerCase()))
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      result = result.filter((note) => {
        // Check if note title contains any of the selected tags
        // This is a simplified approach - in a real app, you'd have proper tags
        return selectedTags.some(
          (tag) =>
            note.title.toLowerCase().includes(tag.toLowerCase()) ||
            NOTES_GROUPS.find((g) => g.id === note.notesGroupId)
              ?.name.toLowerCase()
              .includes(tag.toLowerCase()),
        )
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (mySortBy) {
        case "recent-edit":
          comparison = b.updatedAt.getTime() - a.updatedAt.getTime()
          break
        case "recent-upload":
          comparison = b.createdAt.getTime() - a.createdAt.getTime()
          break
        case "recent-view":
          // In a real app, you'd track last viewed time
          comparison = b.updatedAt.getTime() - a.updatedAt.getTime()
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        default:
          comparison = b.updatedAt.getTime() - a.updatedAt.getTime()
      }

      return mySortOrder === "asc" ? -comparison : comparison
    })

    return result
  }, [NOTES, myNotesSearchTerm, mySortBy, mySortOrder, selectedTags])

  // Filter and sort global notes
  const filteredGlobalNotes = useMemo(() => {
    let result = [...GLOBAL_NOTES]

    // Apply search filter
    if (globalNotesSearchTerm) {
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(globalNotesSearchTerm.toLowerCase()) ||
          note.groupName.toLowerCase().includes(globalNotesSearchTerm.toLowerCase()) ||
          note.author.name.toLowerCase().includes(globalNotesSearchTerm.toLowerCase()),
      )
    }

    // Apply subject filters
    if (filterBy.length > 0) {
      result = result.filter((note) => filterBy.includes(note.groupName))
    }

    // Apply rating filter
    if (minRating > 0) {
      result = result.filter((note) => note.rating >= minRating)
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "recent":
          comparison = b.updatedAt.getTime() - a.updatedAt.getTime()
          break
        case "likes":
          comparison = b.likeCount - a.likeCount
          break
        case "views":
          comparison = b.viewCount - a.viewCount
          break
        case "rating":
          comparison = b.rating - a.rating
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        default:
          comparison = b.updatedAt.getTime() - a.updatedAt.getTime()
      }

      return sortOrder === "asc" ? -comparison : comparison
    })

    return result
  }, [GLOBAL_NOTES, globalNotesSearchTerm, filterBy, sortBy, sortOrder, minRating])

  // Handle creating a new group
  const handleCreateGroup = (groupData: { name: string; description: string }) => {
    // In a real app, you would send this to the backend
    console.log("Creating new group:", groupData)
    alert(`Group "${groupData.name}" created successfully!`)
  }

  // Handle creating a new note
  const handleCreateNote = (noteData: {
    title: string
    notesGroupId: string
    visibility: "public" | "private"
    tags: string[]
    files: File[]
  }) => {
    // In a real app, you would send this to the backend
    console.log("Creating new note:", noteData)
    alert(`Note "${noteData.title}" created successfully!`)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        {/* Navigation Bar */}
        {/* Main Content */}
        <main className="container mx-auto p-4">
          {/* Section Tabs */}
          <div className="mb-6">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeSection === "my-notes"
                    ? "border-b-2 border-emerald-600 text-emerald-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveSection("my-notes")}
              >
                My Notes
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeSection === "global-notes"
                    ? "border-b-2 border-emerald-600 text-emerald-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveSection("global-notes")}
              >
                Global Notes
              </button>
            </div>
          </div>

          {/* My Notes Section */}
          {activeSection === "my-notes" && (
            <>
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold">My Notes</h1>
                <div className="flex gap-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsNewNoteModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Note
                  </Button>
                  <Button variant="outline" onClick={() => setIsNewGroupModalOpen(true)}>
                    <FolderPlus className="mr-2 h-4 w-4" /> New Group
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="all">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Notes</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="groups">Groups</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  <MyNotesFilter
                    searchTerm={myNotesSearchTerm}
                    onSearchChange={setMyNotesSearchTerm}
                    sortBy={mySortBy}
                    onSortByChange={setMySortBy}
                    sortOrder={mySortOrder}
                    onSortOrderChange={setMySortOrder}
                    tags={myTags}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                  />

                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredMyNotes.map((note) => (
                      <Link key={note.id} href={`/notes/${note.id}`}>
                        <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs text-slate-500">{formatRelativeTime(note.updatedAt)}</span>
                              {note.visibility === "private" ? (
                                <EyeOff className="h-3 w-3 text-slate-400" />
                              ) : (
                                <Eye className="h-3 w-3 text-slate-400" />
                              )}
                            </div>
                            <h3 className="mb-1 font-medium">{note.title}</h3>
                            <p className="text-sm text-slate-500">
                              {NOTES_GROUPS.find((g) => g.id === note.notesGroupId)?.name}
                            </p>
                            {note.rating > 0 && (
                              <div className="mt-2">
                                <StarRating rating={note.rating} size="sm" readOnly />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="recent" className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {recentlyViewedNotes.map((note) => (
                      <Link key={note.id} href={`/notes/${note.id}`}>
                        <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                {note.source === "global" ? "Global" : "My Notes"}
                              </span>
                              <span className="text-xs text-slate-500">
                                Viewed {formatRelativeTime(note.lastViewed)}
                              </span>
                            </div>
                            <h3 className="mb-1 font-medium">{note.title}</h3>
                            <p className="text-sm text-slate-500">{note.groupName}</p>
                            {note.rating > 0 && (
                              <div className="mt-2">
                                <StarRating rating={note.rating} size="sm" readOnly />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="groups" className="space-y-6">
                  <MyNotesFilter
                    searchTerm={myNotesSearchTerm}
                    onSearchChange={setMyNotesSearchTerm}
                    sortBy={mySortBy}
                    onSortByChange={setMySortBy}
                    sortOrder={mySortOrder}
                    onSortOrderChange={setMySortOrder}
                    tags={myTags}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                  />

                  {NOTES_GROUPS.filter(
                    (group) => !myNotesSearchTerm || group.name.toLowerCase().includes(myNotesSearchTerm.toLowerCase()),
                  )
                    .filter(
                      (group) =>
                        selectedTags.length === 0 ||
                        selectedTags.some((tag) => group.name.toLowerCase().includes(tag.toLowerCase())),
                    )
                    .sort((a, b) => {
                      if (mySortBy === "title") {
                        return mySortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
                      } else {
                        // Default to sorting by creation date
                        return mySortOrder === "asc"
                          ? a.createdAt.getTime() - b.createdAt.getTime()
                          : b.createdAt.getTime() - a.createdAt.getTime()
                      }
                    })
                    .map((group) => (
                      <Card key={group.id} className="overflow-hidden">
                        <CardHeader className="bg-slate-50 p-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {NOTES.filter((note) => note.notesGroupId === group.id).map((note) => (
                              <Link key={note.id} href={`/notes/${note.id}`}>
                                <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                                  <CardContent className="p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                      <span className="text-xs text-slate-500">
                                        {formatRelativeTime(note.updatedAt)}
                                      </span>
                                      {note.visibility === "private" ? (
                                        <EyeOff className="h-3 w-3 text-slate-400" />
                                      ) : (
                                        <Eye className="h-3 w-3 text-slate-400" />
                                      )}
                                    </div>
                                    <h3 className="font-medium">{note.title}</h3>
                                    {note.rating > 0 && (
                                      <div className="mt-2">
                                        <StarRating rating={note.rating} size="sm" readOnly />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </Link>
                            ))}
                            <Card
                              className="flex h-full cursor-pointer items-center justify-center p-4 text-slate-400 transition-colors hover:bg-slate-50 hover:text-emerald-600"
                              onClick={() => setIsNewNoteModalOpen(true)}
                            >
                              <div className="text-center">
                                <Plus className="mx-auto h-8 w-8" />
                                <p className="mt-2">Add Note</p>
                              </div>
                            </Card>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* Global Notes Section */}
          {activeSection === "global-notes" && (
            <>
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold">Global Notes</h1>
                <p className="text-sm text-slate-500">Discover notes shared by the community</p>
              </div>

              <NotesFilterControls
                searchTerm={globalNotesSearchTerm}
                onSearchChange={setGlobalNotesSearchTerm}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                filterBy={filterBy}
                onFilterByChange={setFilterBy}
                minRating={minRating}
                onMinRatingChange={setMinRating}
              />

              {filteredGlobalNotes.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredGlobalNotes.map((note) => (
                    <GlobalNoteCard
                      key={note.id}
                      id={note.id}
                      title={note.title}
                      author={note.author}
                      groupName={note.groupName}
                      updatedAt={note.updatedAt}
                      viewCount={note.viewCount}
                      likeCount={note.likeCount}
                      dislikeCount={note.dislikeCount}
                      thumbnail={note.thumbnail}
                      rating={note.rating}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <BookOpen className="mb-4 h-12 w-12 text-slate-300" />
                  <h3 className="mb-2 text-xl font-medium">No notes found</h3>
                  <p className="text-sm text-slate-500">
                    {globalNotesSearchTerm || filterBy.length > 0 || minRating > 0
                      ? "Try adjusting your search or filters"
                      : "Be the first to share your notes with the community"}
                  </p>
                </div>
              )}
            </>
          )}
        </main>

        {/* Modals */}
        <NewGroupModal
          isOpen={isNewGroupModalOpen}
          onClose={() => setIsNewGroupModalOpen(false)}
          onSubmit={handleCreateGroup}
        />

        <NewNoteModal
          isOpen={isNewNoteModalOpen}
          onClose={() => setIsNewNoteModalOpen(false)}
          onSubmit={handleCreateNote}
        />
      </div>
    </>
  )
}
