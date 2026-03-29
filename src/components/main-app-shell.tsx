import * as React from "react";
import { useUser, db } from "@/firebase";
import { collection, query, orderBy, limit, onSnapshot, type DocumentData } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  BrainCircuit, 
  Heart, 
  Zap,
  Volume2,
  Languages,
  BookOpen,
  Loader2,
  RefreshCw,
  Award,
  Target,
  LayoutDashboard,
  GraduationCap,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/user-profile";
import { ChatTutor } from "@/components/chat-tutor";
import { LessonEngine } from "@/components/lesson-engine";
import { UserNav } from "@/components/auth-gate";
import { WordsBrowser } from "@/components/words-browser";
import { GrammarBrowser } from "@/components/grammar-browser";
import { IdiomsBrowser } from "@/components/idioms-browser";
import { PracticeEngine } from "@/components/practice-engine";
import { ContentImporter } from "@/components/content-importer";
import { PdfImporter } from "@/components/pdf-importer";
import { AiTeacherAssistant } from "@/components/ai-teacher-assistant";

export function MainAppShell() {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const { user } = useUser();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "lessons", label: "Lessons", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "practice", label: "Practice", icon: Target, color: "text-red-500", bg: "bg-red-500/10" },
    { id: "tutor", label: "AI Tutor", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "library", label: "Library", icon: BookOpen, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "idioms", label: "Idioms", icon: MessageSquare, color: "text-pink-500", bg: "bg-pink-500/10" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <span className="text-xl font-black text-primary-foreground">D4S</span>
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-lg font-black tracking-tight">Dutch Farsi Mentor</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Master Dutch with AI</span>
            </div>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={cn(
                  "h-10 gap-2 px-4 font-bold transition-all",
                  activeTab === item.id && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className={cn("h-4 w-4", activeTab === item.id ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </Button>
            ))}
          </div>

          <UserNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-black tracking-tight">Welkom terug, {user?.displayName?.split(' ')[0]}!</h1>
                  <p className="text-lg text-muted-foreground">Ready to continue your Dutch journey? (آماده ادامه یادگیری هلندی هستی؟)</p>
                </div>
                <UserProfile />
                
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-2 shadow-lg transition-all hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <CardTitle>Daily Goal</CardTitle>
                      </div>
                      <CardDescription>Complete 3 lessons to keep your streak alive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm font-bold">
                        <span>Progress</span>
                        <span>1 / 3</span>
                      </div>
                      <Progress value={33} className="h-3" />
                      <Button className="w-full font-bold" onClick={() => setActiveTab("lessons")}>
                        Resume Learning
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 shadow-lg transition-all hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle>AI Tutor Suggestion</CardTitle>
                      </div>
                      <CardDescription>Based on your recent mistakes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-xl bg-primary/5 p-4 border-l-4 border-primary">
                        <p className="text-sm font-medium leading-relaxed">
                          "You've been struggling with the <strong>V2 rule</strong> in complex sentences. Let's practice placing the verb correctly!"
                        </p>
                      </div>
                      <Button variant="outline" className="w-full font-bold border-2" onClick={() => setActiveTab("tutor")}>
                        Chat with D4S
                        <MessageSquare className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <AiTeacherAssistant />
                  <div className="flex flex-col gap-6">
                    <ContentImporter />
                    <PdfImporter />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "lessons" && (
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-black tracking-tight">Lessons</h1>
                  <p className="text-lg text-muted-foreground">Structured learning paths for every level.</p>
                </div>
                <LessonEngine />
              </div>
            )}

            {activeTab === "practice" && (
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-black tracking-tight">Practice</h1>
                  <p className="text-lg text-muted-foreground">Sharpen your skills with interactive exercises.</p>
                </div>
                <PracticeEngine 
                  exercises={[]} 
                  onComplete={() => {}} 
                  onClose={() => {}} 
                />
              </div>
            )}

            {activeTab === "tutor" && (
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-black tracking-tight">AI Tutor</h1>
                  <p className="text-lg text-muted-foreground">Ask questions, practice conversation, and get instant feedback.</p>
                </div>
                <ChatTutor />
              </div>
            )}

            {activeTab === "library" && (
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-black tracking-tight">Library</h1>
                  <p className="text-lg text-muted-foreground">Browse vocabulary and grammar rules.</p>
                </div>
                <Tabs defaultValue="vocabulary" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-12 border-2">
                    <TabsTrigger value="vocabulary" className="font-bold">Vocabulary</TabsTrigger>
                    <TabsTrigger value="grammar" className="font-bold">Grammar</TabsTrigger>
                  </TabsList>
                  <TabsContent value="vocabulary" className="mt-6">
                    <WordsBrowser />
                  </TabsContent>
                  <TabsContent value="grammar" className="mt-6">
                    <GrammarBrowser />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeTab === "idioms" && (
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-black tracking-tight">Idioms</h1>
                  <p className="text-lg text-muted-foreground">Master Dutch idioms and phrases.</p>
                </div>
                <IdiomsBrowser />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      <div className="sticky bottom-0 z-50 flex w-full border-t bg-background/95 backdrop-blur md:hidden">
        <div className="flex w-full items-center justify-around p-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "flex h-12 flex-col items-center gap-1 px-2 font-bold transition-all",
                activeTab === item.id ? "text-primary" : "text-muted-foreground"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
