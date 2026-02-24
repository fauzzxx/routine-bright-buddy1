import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast.success("Account created successfully!");
      navigate("/caregiver");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Signed in successfully!");
      navigate("/caregiver");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-inter">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Playful Header Illustration and Progress */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-float-slow">
            <Heart className="w-12 h-12 text-primary fill-primary/20" />
          </div>
          <div className="flex gap-2 mb-2">
            <div className="w-8 h-2 bg-primary rounded-full" />
            <div className="w-8 h-2 bg-primary/20 rounded-full" />
          </div>
        </div>

        <Card className="border-none shadow-vibrant overflow-hidden rounded-[2.5rem]">
          <div className="bg-primary p-8 text-center text-white">
            <h1 className="text-3xl font-fredoka mb-2">
              Join KidsLand!
            </h1>
            <p className="text-primary-foreground/80 text-sm">
              Explore and learn with fun characters
            </p>
          </div>

          <CardContent className="p-8 bg-white dark:bg-card">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-2xl mb-8">
                <TabsTrigger value="signin" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-0">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-foreground/70 ml-1">Email Address</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-2xl border-muted bg-muted/30 focus:bg-white transition-all h-12 px-4 shadow-cartoon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" style={{ marginLeft: '0.25rem' }} className="text-foreground/70">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-2xl border-muted bg-muted/30 focus:bg-white transition-all h-12 px-4 shadow-cartoon"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-2xl text-lg font-fredoka shadow-vibrant hover:scale-[1.02] transition-transform" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Start Learning!"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-foreground/70 ml-1">Parent's Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="rounded-2xl border-muted bg-muted/30 focus:bg-white transition-all h-12 px-4 shadow-cartoon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground/70 ml-1">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-2xl border-muted bg-muted/30 focus:bg-white transition-all h-12 px-4 shadow-cartoon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" style={{ marginLeft: '0.25rem' }} className="text-foreground/70">Create Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="rounded-2xl border-muted bg-muted/30 focus:bg-white transition-all h-12 px-4 shadow-cartoon"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-2xl text-lg font-fredoka shadow-vibrant hover:scale-[1.02] transition-transform" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Join the Adventure!"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-muted-foreground text-sm font-medium">
          Transform routines into stories with RoutineBright
        </p>
      </div>
    </div>
  );
}
