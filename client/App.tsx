import "./global.css";

import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SelfieProvider } from "./contexts/SelfieContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Preloader from "@/components/Preloader";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import Leaderboard from "./pages/Leaderboard";
import UploadSelfie from "./pages/UploadSelfie";
import Profile from "./pages/Profile";
import CreateChallenge from "./pages/CreateChallenge";
import ChallengeDetails from "./pages/ChallengeDetails";
import InviteChallenge from "./pages/InviteChallenge";
import PlayChallenge from "./pages/PlayChallenge";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <>
      {showPreloader && (
        <Preloader onComplete={() => setShowPreloader(false)} />
      )}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
          <AuthProvider>
            <SelfieProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected user routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireRole="user">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenges"
                element={
                  <ProtectedRoute requireRole="user">
                    <Challenges />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute requireRole="user">
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute requireRole="user">
                    <UploadSelfie />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute requireRole="user">
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenge/create"
                element={
                  <ProtectedRoute requireRole="user">
                    <CreateChallenge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenge/invite/:inviteCode"
                element={<InviteChallenge />}
              />
              <Route
                path="/play-challenge/:inviteCode"
                element={
                  <ProtectedRoute requireRole="user">
                    <PlayChallenge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenge/:uniqueCode"
                element={<ChallengeDetails />}
              />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SelfieProvider>
      </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
    </>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
