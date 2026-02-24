import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, three-step process to create personalized learning experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-3xl">
                ✍️
              </div>
              <h3 className="text-xl font-bold">1. Describe Routine</h3>
              <p className="text-muted-foreground">
                Enter a routine name or choose from our library of pre-built activities
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto text-3xl">
                ✨
              </div>
              <h3 className="text-xl font-bold">2. AI Generates Content</h3>
              <p className="text-muted-foreground">
                Our AI creates step-by-step flashcards and videos tailored to your routine
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto text-3xl">
                👶
              </div>
              <h3 className="text-xl font-bold">3. Child Learns</h3>
              <p className="text-muted-foreground">
                Review, approve, and share the content with your child for interactive learning
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
