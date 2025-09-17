import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, CheckCircle } from "lucide-react"

interface AgentCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: "idle" | "running" | "completed"
  onRun: () => void
  results?: {
    count: number
    type: string
  }
}

export function AgentCard({ title, description, icon: Icon, status, onRun, results }: AgentCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusColor = () => {
    switch (status) {
      case "running": return "secondary"
      case "completed": return "default"
      default: return "outline"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "running": return "Processing..."
      case "completed": return `${results?.count || 0} ${results?.type || "results"} generated`
      default: return "Ready to run"
    }
  }

  return (
    <Card 
      className="hover-elevate transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-agent-${title.toLowerCase().replace(' ', '-')}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
          <Badge variant={getStatusColor()} className="ml-2">
            {status === "running" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            {status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
            <span className="capitalize">{status}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{getStatusText()}</p>
          <Button 
            size="sm" 
            onClick={onRun}
            disabled={status === "running"}
            variant={isHovered ? "default" : "outline"}
            className="ml-4"
            data-testid={`button-run-${title.toLowerCase().replace(' ', '-')}`}
          >
            {status === "running" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {status === "running" ? "Running..." : "Run Agent"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}