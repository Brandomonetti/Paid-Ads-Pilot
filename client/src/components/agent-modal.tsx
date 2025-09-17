import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, MessageSquare, Copy, Sparkles } from "lucide-react"

interface AgentResult {
  id: string
  title: string
  content: string
  type: "angle" | "script" | "insight" | "template"
  feedback?: "approved" | "rejected"
  comment?: string
}

interface AgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentType: "research" | "script" | "performance" | "asset"
  title: string
  results: AgentResult[]
}

export function AgentModal({ open, onOpenChange, agentType, title, results }: AgentModalProps) {
  const [feedback, setFeedback] = useState<Record<string, { type: "approved" | "rejected", comment?: string }>>({})
  const [comments, setComments] = useState<Record<string, string>>({})

  const handleFeedback = (resultId: string, type: "approved" | "rejected") => {
    setFeedback(prev => ({
      ...prev,
      [resultId]: { type, comment: comments[resultId] }
    }))
    console.log(`Feedback for ${resultId}:`, type, comments[resultId])
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    console.log("Copied to clipboard:", content)
  }

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case "angle": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "script": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "insight": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "template": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="modal-agent-results">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {title} Results
          </DialogTitle>
          <DialogDescription>
            Review and provide feedback on the generated {agentType} results
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {results.map((result) => (
            <Card key={result.id} className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                    <Badge className={getResultTypeColor(result.type)}>
                      {result.type}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(result.content)}
                    data-testid={`button-copy-${result.id}`}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm whitespace-pre-wrap">{result.content}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Textarea
                    placeholder="Add feedback or comments..."
                    value={comments[result.id] || ""}
                    onChange={(e) => setComments(prev => ({ ...prev, [result.id]: e.target.value }))}
                    className="flex-1"
                    rows={2}
                    data-testid={`textarea-comment-${result.id}`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={feedback[result.id]?.type === "approved" ? "default" : "outline"}
                      onClick={() => handleFeedback(result.id, "approved")}
                      data-testid={`button-approve-${result.id}`}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant={feedback[result.id]?.type === "rejected" ? "destructive" : "outline"}
                      onClick={() => handleFeedback(result.id, "rejected")}
                      data-testid={`button-reject-${result.id}`}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                  
                  {feedback[result.id] && (
                    <Badge variant={feedback[result.id].type === "approved" ? "default" : "destructive"}>
                      {feedback[result.id].type}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => {
            console.log("Saving all feedback:", feedback)
            onOpenChange(false)
          }}>
            Save Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}