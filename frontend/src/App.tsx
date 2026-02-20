import { Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import RepoPage from "@/pages/RepoPage"
import { Sidebar } from "@/components/Sidebar"
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Sidebar />
                <main className="flex-1 flex items-center justify-center p-6 bg-background overflow-auto">
                  <Home />
                </main>
              </>
            }
          />
          <Route
            path="/repo/:repoName"
            element={
              <>
                <Sidebar />
                <main className="flex-1 overflow-auto bg-background">
                  <RepoPage />
                </main>
              </>
            }
          />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
