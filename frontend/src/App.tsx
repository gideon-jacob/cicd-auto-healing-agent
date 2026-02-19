import DemoPage from "@/pages/DemoPage"
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DemoPage />
    </ThemeProvider>
  )
}

export default App
