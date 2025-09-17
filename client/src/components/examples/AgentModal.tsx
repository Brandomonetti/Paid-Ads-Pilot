import { useState } from 'react'
import { AgentModal } from '../agent-modal'
import { Button } from '@/components/ui/button'

const mockResults = [
  {
    id: "1",
    title: "Busy Parent Avatar - Time Crunch Pain Point",
    content: "Target: Working parents aged 28-45 struggling with meal prep\n\nPain Point: No time to cook healthy meals for family\n\nHooks:\n1. 'What if dinner could be ready in 10 minutes?'\n2. 'Stop feeling guilty about takeout orders'\n3. 'Your kids deserve better than processed food'\n\nFormat: Video testimonial with real parent",
    type: "angle" as const
  },
  {
    id: "2", 
    title: "Health-Conscious Millennial - Quality Concerns",
    content: "Target: Health-focused millennials aged 25-35 in urban areas\n\nPain Point: Uncertain about food quality and sourcing\n\nHooks:\n1. 'Finally, know exactly what's in your food'\n2. 'Organic doesn't have to break the bank'\n3. 'Your body will thank you for this switch'\n\nFormat: Before/after transformation story",
    type: "angle" as const
  }
]

export default function AgentModalExample() {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-8 bg-background">
      <Button onClick={() => setOpen(true)}>
        View Agent Results
      </Button>
      <AgentModal
        open={open}
        onOpenChange={setOpen}
        agentType="research"
        title="Research Agent"
        results={mockResults}
      />
    </div>
  )
}