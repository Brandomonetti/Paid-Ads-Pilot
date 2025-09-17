import { PerformanceChart } from '../performance-chart'

export default function PerformanceChartExample() {
  return (
    <div className="p-8 bg-background">
      <PerformanceChart mockData={true} />
    </div>
  )
}