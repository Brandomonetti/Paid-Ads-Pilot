import { ThemeProvider } from '../theme-provider'

export default function ThemeProviderExample() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="p-8 bg-background text-foreground">
        <h2 className="text-2xl font-bold mb-4">Theme Provider Active</h2>
        <p className="text-muted-foreground">Dark theme is enabled by default for Creative Strategist AI.</p>
      </div>
    </ThemeProvider>
  )
}