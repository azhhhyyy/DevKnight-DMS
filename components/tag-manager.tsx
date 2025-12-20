"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Tag } from "@/lib/types"

const TAG_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
]

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface TagManagerProps {
  documentId: string
  documentTags: Tag[]
  onTagsChange: () => void
}

export function TagManager({ documentId, documentTags, onTagsChange }: TagManagerProps) {
  const [newTagName, setNewTagName] = useState("")
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0])
  const [isCreating, setIsCreating] = useState(false)

  const { data, mutate: mutateTags } = useSWR<{ tags: Tag[] }>("/api/tags", fetcher)
  const allTags = data?.tags || []

  const availableTags = allTags.filter((tag) => !documentTags.some((dt) => dt.id === tag.id))

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    setIsCreating(true)

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim(), color: selectedColor }),
      })

      if (res.ok) {
        setNewTagName("")
        mutateTags()
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleAddTag = async (tagId: string) => {
    await fetch(`/api/documents/${documentId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagId }),
    })
    onTagsChange()
  }

  const handleRemoveTag = async (tagId: string) => {
    await fetch(`/api/documents/${documentId}/tags?tagId=${tagId}`, {
      method: "DELETE",
    })
    onTagsChange()
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {documentTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color }}
            className="border"
          >
            {tag.name}
            <button onClick={() => handleRemoveTag(tag.id)} className="ml-1.5 hover:opacity-70">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs bg-transparent">
              <Plus className="h-3 w-3 mr-1" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <p className="text-sm font-medium">Add Tags</p>

              {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer hover:opacity-80"
                      style={{ borderColor: tag.color, color: tag.color }}
                      onClick={() => handleAddTag(tag.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-2">Create new tag</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || isCreating}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-5 h-5 rounded-full border-2 ${
                        selectedColor === color ? "border-foreground" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
