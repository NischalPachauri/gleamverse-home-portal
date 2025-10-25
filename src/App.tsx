import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import BookDetail from "./pages/BookDetail";
import Bookmarks from "./pages/Bookmarks";
import Profile from "./pages/Profile";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import TestApp from "./TestApp";

const queryClient = new QueryClient();

// Simple test component to verify React is working
const TestComponent = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>React App is Working!</h1>
    <p>If you can see this, the basic setup is working.</p>
  </div>
);

const App = () => {
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen light:bg-[#f0f8ff]">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/test" element={<TestApp />} />
                    <Route path="/book/:id" element={<BookDetail />} />
                    <Route path="/bookmarks" element={<Bookmarks />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/component-test" element={<TestComponent />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('App error:', error);
    return <TestComponent />;
  }
};

export default App;