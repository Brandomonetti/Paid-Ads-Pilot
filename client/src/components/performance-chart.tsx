import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  change: number
  changeLabel: string
  color?: "green" | "red" | "blue"
}

function MetricCard({ title, value, change, changeLabel, color = "blue" }: MetricCardProps) {
  const isPositive = change > 0
  const colorClasses = {
    green: isPositive ? "text-green-600" : "text-red-600",
    red: isPositive ? "text-red-600" : "text-green-600", 
    blue: isPositive ? "text-blue-600" : "text-red-600"
  }

  return (
    <Card data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs">{title}</CardDescription>
        <CardTitle className="text-2xl font-bold">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600" />
          )}
          <span className={`text-xs font-medium ${colorClasses[color]}`}>
            {isPositive ? "+" : ""}{change}% {changeLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

interface PerformanceChartProps {
  //todo: remove mock functionality
  mockData?: boolean
}

export function PerformanceChart({ mockData = true }: PerformanceChartProps) {
  //todo: remove mock functionality
  const metrics = [
    { title: "ROAS", value: "4.2x", change: 12.5, changeLabel: "vs last week", color: "green" as const },
    { title: "CTR", value: "2.8%", change: -0.3, changeLabel: "vs last week", color: "red" as const },
    { title: "CPC", value: "$0.42", change: -8.1, changeLabel: "vs last week", color: "green" as const },
    { title: "Hook Rate", value: "85%", change: 5.2, changeLabel: "vs last week", color: "green" as const },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Overview</h3>
          <p className="text-sm text-muted-foreground">Real-time metrics from connected Meta ad accounts</p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Live Data
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Performing Creatives</CardTitle>
          <CardDescription>Based on ROAS and engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Summer Sale Video Ad", roas: "6.8x", spend: "$2,340" },
              { name: "Product Demo Carousel", roas: "5.2x", spend: "$1,890" },
              { name: "Customer Testimonial", roas: "4.9x", spend: "$1,567" },
            ].map((ad, index) => (
              <div key={ad.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{ad.name}</p>
                  <p className="text-xs text-muted-foreground">Spend: {ad.spend}</p>
                </div>
                <Badge variant="outline">{ad.roas} ROAS</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}