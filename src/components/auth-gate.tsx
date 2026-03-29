import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/firebase";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import * as React from "react";
import { ensureUserProfile } from "@/firebase/user-profile";
import { useToast } from "@/hooks/use-toast";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const { toast } = useToast();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await ensureUserProfile(db, result.user.uid);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred during login.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-2 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-3xl font-bold text-primary">D4S</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Dutch Farsi Mentor</CardTitle>
            <CardDescription className="text-base">
              Learn Dutch through the lens of Farsi. Master V2, de/het, and more.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button 
              onClick={handleLogin} 
              className="h-12 w-full text-lg font-semibold transition-all hover:scale-[1.02]"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export function UserNav() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium">{user.displayName}</span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => signOut(auth)}
        className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
