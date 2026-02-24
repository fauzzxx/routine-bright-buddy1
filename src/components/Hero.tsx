import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Lightbulb, Video, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 text-secondary-foreground mb-8">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Supporting Children with ASD</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            AI-Powered Learning
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Made Simple & Calm
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform daily routines into visual stories. Our AI creates personalized flashcards and videos to help children with Autism Spectrum Disorder adapt to new experiences with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/caregiver">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Video className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Adaptation</h3>
              <p className="text-muted-foreground text-sm">
                AI breaks down routines into simple, visual steps that are easy to understand
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Visual Learning</h3>
              <p className="text-muted-foreground text-sm">
                Colorful flashcards and scenario videos make learning engaging and memorable
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 mx-auto">
                <Heart className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Caregiver Control</h3>
              <p className="text-muted-foreground text-sm">
                Review, edit, and approve all content before sharing with your child
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
