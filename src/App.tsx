import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Caregiver from "./pages/Caregiver";
import CreateRoutine from "./pages/CreateRoutine";
import Child from "./pages/Child";
import RoutineDetail from "./pages/RoutineDetail";
import TestMode from "./pages/TestMode";
import Planner from "./pages/Planner";
import Todo from "./pages/Todo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/caregiver" element={<Caregiver />} />
            <Route path="/create-routine" element={<CreateRoutine />} />
            <Route path="/routine/:id" element={<RoutineDetail />} />
            <Route path="/child" element={<Child />} />
            <Route path="/test/:activity" element={<TestMode />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/todo" element={<Todo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
