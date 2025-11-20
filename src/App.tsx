import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const Favorites = lazy(() => import("./pages/Favorites"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DonatePage = lazy(() => import("./pages/Donate"));
const HelpPage = lazy(() => import("./pages/Help"));
const ProfileWindow = lazy(() => import("@/components/ProfileWindow").then(module => ({ default: module.ProfileWindow })));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();


const App = () => {
  return (
    <ErrorBoundary name="Root">
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary name="ThemeProvider">
          <ThemeProvider>
            <ErrorBoundary name="AuthProvider">
              <AuthProvider>
                <TooltipProvider>

                  <Sonner />
                  <BrowserRouter>
                    <div className="min-h-screen dark:bg-background" style={{ backgroundColor: 'var(--background-color)', visibility: 'visible', opacity: 1 }}>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={
                            <ErrorBoundary name="IndexPage">
                              <Index />
                            </ErrorBoundary>
                          } />

                          <Route path="/book/:id" element={<BookDetail />} />
                          <Route path="/bookmarks" element={<Bookmarks />} />
                          <Route path="/favorites" element={
                            <ErrorBoundary name="FavoritesPage">
                              <Favorites />
                            </ErrorBoundary>
                          } />

                          <Route path="/profile" element={
                            <ErrorBoundary name="ProfilePage">
                              <ProfileWindow />
                            </ErrorBoundary>
                          } />
                          <Route path="/donate" element={
                            <ErrorBoundary name="DonatePage">
                              <DonatePage />
                            </ErrorBoundary>
                          } />
                          <Route path="/help" element={
                            <ErrorBoundary name="HelpPage">
                              <HelpPage />
                            </ErrorBoundary>
                          } />
                          <Route path="/auth/callback" element={
                            <ErrorBoundary name="AuthCallback">
                              <AuthCallback />
                            </ErrorBoundary>
                          } />

                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </div>
                  </BrowserRouter>
                </TooltipProvider>
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
