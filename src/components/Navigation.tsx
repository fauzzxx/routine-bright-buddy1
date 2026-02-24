import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, BookOpen, LogOut, Home, Calendar, CheckSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const demoMode = import.meta.env.VITE_DEMO_MODE === "true" || !isSupabaseConfigured;

  return (
    <nav className="fixed top-0 w-full bg-card/80 backdrop-blur-lg border-b border-border z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RoutineAI
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.home')}</span>
              </Button>
            </Link>
            <Link to="/caregiver">
              <Button variant="ghost" size="sm" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.caregiver')}</span>
              </Button>
            </Link>
            <Link to="/child">
              <Button variant="outline" size="sm" className="gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.child')}</span>
              </Button>
            </Link>
            <Link to="/planner">
              <Button variant="ghost" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Planner</span>
              </Button>
            </Link>
            <Link to="/todo">
              <Button variant="ghost" size="sm" className="gap-2">
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">To-Do</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
