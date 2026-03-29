import * as React from "react";
import { AuthGate } from "./components/auth-gate";
import { Toaster } from "./components/ui/toaster";
import { auth, useUser, db } from "@/firebase";
import { collection, getDocs, doc, getDoc, query, limit, where } from "firebase/firestore";
import { PracticeEngine, Exercise } from "./components/practice-engine";
import { IdiomsBrowser } from "./components/idioms-browser";
import { saveSRSResult, updateLearnerProgress } from "./firebase/learning-service";
import { SRSGrade } from "./services/srs-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Target, 
  BookOpen,
  Mic,
  User,
  Search,
  Award,
  Flame,
  Volume2,
  Layers,
  RotateCcw,
  Sparkles,
  Loader2,
  History as HistoryIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { speakDutch, recognizeSpeech } from "@/services/speechService";
import { cn } from "@/lib/utils";

function App() {
  return (
    <AuthGate>
      <MainApp />
      <Toaster />
    </AuthGate>
  );
}

function MainApp() {
  const { user } = useUser();
  const { toast } = useToast();
  const [progress, setProgress] = React.useState({
    v2Accuracy: 0.65,
    deHetAccuracy: 0.45,
    vocabAccuracy: 0.80,
    points: 1250,
    streak: 5,
    learnedWords: 142
  });
  const [library, setLibrary] = React.useState<{ vocabulary: any[], grammar: any[] }>({ vocabulary: [], grammar: [] });
  const [activeExercises, setActiveExercises] = React.useState<Exercise[]>([]);
  const [isPracticing, setIsPracticing] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [loadingSRS, setLoadingSRS] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      loadProgress();
    }
    loadLibrary();
  }, [user]);

  const startPractice = async (topic: string) => {
    setIsTyping(true);
    try {
      const q = topic === "General" 
        ? query(collection(db, "practice_exercises"), limit(10))
        : query(collection(db, "practice_exercises"), where("topic", "==", topic), limit(10));
      const exercisesSnap = await getDocs(q);
      let exercises: Exercise[] = exercisesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
      setActiveExercises(exercises);
      setIsPracticing(true);
    } catch (e) {
      console.error("Practice start failed", e);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePracticeComplete = async (results: { exerciseId: string; grade: SRSGrade }[]) => {
    setIsPracticing(false);
    if (user) {
      for (const res of results) {
        const item = library.vocabulary.find(v => v.id === res.exerciseId) || 
                     library.grammar.find(g => g.id === res.exerciseId);
        const type = item?.type === 'grammar' ? 'grammar' : 'vocabulary';
        await saveSRSResult(db, user.uid, res.exerciseId, type, res.grade);
      }
      const allCorrect = results.every(r => r.grade !== 'Again');
      await updateLearnerProgress(db, user.uid, 'vocabulary', allCorrect);
    }
    loadProgress();
  };

  const loadLibrary = async () => {
    try {
      const vocabSnap = await getDocs(query(collection(db, "vocabulary"), limit(100)));
      const grammarSnap = await getDocs(query(collection(db, "grammar"), limit(100)));
      
      const vocabulary = vocabSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const grammar = grammarSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (vocabulary.length > 0 || grammar.length > 0) {
        setLibrary({ vocabulary, grammar });
      }
    } catch (e) {
      console.error("Library load failed", e);
    }
  };

  const loadProgress = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.progress || data.profile) {
          setProgress(prev => ({ 
            ...prev, 
            ...(data.progress || {}),
            points: data.profile?.xp || prev.points,
            streak: data.profile?.streak || prev.streak,
            learnedWords: data.progress?.wordsLearned || prev.learnedWords
          }));
        }
      }
    } catch (e) {
      console.error("Progress load failed", e);
    }
  };

  const seedDatabase = async () => {
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Database seeded successfully. Refreshing library...",
        });
        loadLibrary();
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to seed database.",
        variant: "destructive"
      });
    }
  };

  const handleSRSReview = async (id: string, type: string) => {
    if (!user) return;
    setLoadingSRS(id);
    try {
      await saveSRSResult(db, user.uid, id, type === 'grammar' ? 'grammar' : 'vocabulary', 'Good');
      toast({
        title: "Review Saved",
        description: "Item marked as 'Good' for your next review.",
      });
    } catch (error) {
      console.error("Failed to save SRS result", error);
      toast({
        title: "Error",
        description: "Failed to save review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingSRS(null);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="bg-primary text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-highlight p-2 rounded-xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Dutch Farsi Mentor</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm font-medium">
            <Flame className="h-4 w-4 text-orange-400 fill-orange-400" />
            {progress.streak}
          </div>
          <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm font-medium">
            <Award className="h-4 w-4 text-yellow-400" />
            {progress.points}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white/50 backdrop-blur p-1 rounded-2xl border border-border shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary">
              <LayoutDashboard className="h-4 w-4 mr-2 hidden sm:inline" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary">
              <BookOpen className="h-4 w-4 mr-2 hidden sm:inline" />
              Vocabulary
            </TabsTrigger>
            <TabsTrigger value="grammar" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary">
              <Layers className="h-4 w-4 mr-2 hidden sm:inline" />
              Grammar
            </TabsTrigger>
            <TabsTrigger value="idioms" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary">
              <Sparkles className="h-4 w-4 mr-2 hidden sm:inline" />
              Idioms
            </TabsTrigger>
            <TabsTrigger value="practice" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary">
              <Target className="h-4 w-4 mr-2 hidden sm:inline" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary">
              <User className="h-4 w-4 mr-2 hidden sm:inline" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Metrics Grid */}
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Current Level</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-display font-bold text-primary">A1</div></CardContent>
              </Card>
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Experience (XP)</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-display font-bold text-highlight">{progress.points}</div></CardContent>
              </Card>
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Daily Streak</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-display font-bold text-orange-500">{progress.streak} days</div></CardContent>
              </Card>
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Words Learned</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-display font-bold text-emerald-600">{progress.learnedWords}</div></CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 border-b pb-4">
                    <div className="bg-primary/10 p-2 rounded-full"><BookOpen className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="font-medium">Completed Vocabulary Lesson</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-highlight/10 p-2 rounded-full"><Target className="h-5 w-5 text-highlight" /></div>
                    <div>
                      <p className="font-medium">Practiced V2 Rule</p>
                      <p className="text-sm text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Earned Badges</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-yellow-100 p-4 rounded-full"><Award className="h-8 w-8 text-yellow-600" /></div>
                    <span className="text-xs font-bold">Fast Learner</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-blue-100 p-4 rounded-full"><Flame className="h-8 w-8 text-blue-600" /></div>
                    <span className="text-xs font-bold">5 Day Streak</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vocabulary" className="outline-none">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur min-h-[500px]">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Vocabulary</CardTitle>
                <CardDescription>Browse your learned words and phrases.</CardDescription>
                <div className="pt-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search words or rules..." className="pl-10 rounded-xl bg-background border-0" />
                  </div>
                  <Button variant="outline" className="rounded-xl border-border">Filter</Button>
                  {user?.email === "amo@gemarineerd.me" && (
                    <>
                      <Button 
                        variant="secondary" 
                        className="rounded-xl bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={seedDatabase}
                      >
                        Seed Database
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="rounded-xl bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={async () => {
                          const token = await auth.currentUser?.getIdToken();
                          const response = await fetch("/api/update-vocabulary-pronunciation", {
                            method: "POST",
                            headers: { "Authorization": `Bearer ${token}` },
                          });
                          const data = await response.json();
                          toast({ title: "Update", description: data.message });
                        }}
                      >
                        Update Pronunciation
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {library.vocabulary.length > 0 ? library.vocabulary.map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-background border border-border hover:border-highlight transition-colors cursor-pointer group flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-highlight uppercase tracking-widest">{item.type || 'Word'}</span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-border font-bold">{item.level || 'A1'}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-display font-bold group-hover:text-highlight transition-colors">{item.dutch}</h3>
                      </div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <p className="text-muted-foreground text-sm rtl">{item.farsi}</p>
                        <div className="flex items-center gap-2">
                          {item.pronunciation && (
                            <span className="text-sm font-medium text-primary rtl bg-primary/10 px-2 py-0.5 rounded-md">{item.pronunciation}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-highlight"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSRSReview(item.id, item.type);
                          }}
                          disabled={loadingSRS === item.id}
                        >
                          {loadingSRS === item.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3 w-3 mr-1" />
                          )}
                          Quick Review
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-highlight"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakDutch(item.dutch);
                          }}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      No items found in your library yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grammar" className="outline-none">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur min-h-[500px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display text-2xl">Grammar Rules</CardTitle>
                  <CardDescription>Review the grammar rules you've learned.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  {library.grammar.length > 0 ? library.grammar.map((item, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-background border border-border hover:border-highlight transition-colors flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-display font-bold text-highlight">{item.dutch}</h3>
                        <span className="text-sm font-medium text-primary rtl bg-primary/10 px-3 py-1 rounded-md">{item.farsi}</span>
                      </div>
                      <p className="text-muted-foreground mb-6 rtl">{item.content}</p>
                      
                      {item.examples && item.examples.length > 0 && (
                        <div className="space-y-3 bg-muted/30 p-4 rounded-xl max-h-64 overflow-y-auto">
                          <h4 className="text-sm font-bold text-foreground">Examples ({item.examples.length}):</h4>
                          {item.examples.map((ex: any, idx: number) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-border/50 pb-2 last:border-0 last:pb-0">
                              <span className="font-medium">{ex.dutch}</span>
                              <span className="text-sm text-muted-foreground rtl">{ex.farsi}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {item.detailedExamples && item.detailedExamples.length > 0 && (
                        <div className="space-y-3 bg-primary/5 p-4 rounded-xl mt-4">
                          <h4 className="text-sm font-bold text-primary">Detailed Examples:</h4>
                          {item.detailedExamples.map((ex: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <p className="font-medium">{ex.dutch} - <span className="text-muted-foreground">{ex.farsi}</span></p>
                              <p className="text-xs text-muted-foreground mt-1">{ex.explanation}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.commonMistakes && item.commonMistakes.length > 0 && (
                        <div className="space-y-3 bg-destructive/5 p-4 rounded-xl mt-4">
                          <h4 className="text-sm font-bold text-destructive">Common Mistakes:</h4>
                          {item.commonMistakes.map((mistake: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <p className="font-medium text-destructive">{mistake.mistake} → {mistake.correction}</p>
                              <p className="text-xs text-muted-foreground mt-1">{mistake.explanation}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 px-3 text-xs font-bold"
                          onClick={async () => {
                            const token = await auth.currentUser?.getIdToken();
                            const response = await fetch("/api/update-grammar-explanations", {
                              method: "POST",
                              headers: { "Authorization": `Bearer ${token}` },
                            });
                            const data = await response.json();
                            toast({ title: "Update", description: data.message });
                          }}
                        >
                          Update Rules
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs font-bold"
                          onClick={async () => {
                            try {
                              toast({ title: "Listening...", description: "Speak the rule aloud." });
                              const transcript = await recognizeSpeech();
                              toast({ title: "Analyzing...", description: "Comparing with grammar rule." });
                              const token = await auth.currentUser?.getIdToken();
                              const response = await fetch("/api/ai/analyze-pronunciation", {
                                method: "POST",
                                headers: { 
                                  "Content-Type": "application/json",
                                  "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify({ targetText: item.dutch, recognizedText: transcript }),
                              });
                              const data = await response.json();
                              toast({ title: "Feedback", description: data.feedback });
                            } catch (error) {
                              toast({ title: "Error", description: "Failed to recognize speech or get feedback.", variant: "destructive" });
                            }
                          }}
                        >
                          <Mic className="h-3 w-3 mr-2" />
                          Practice Speaking
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs text-muted-foreground hover:text-highlight"
                          onClick={() => handleSRSReview(item.id, 'grammar')}
                          disabled={loadingSRS === item.id}
                        >
                          {loadingSRS === item.id ? (
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3 w-3 mr-2" />
                          )}
                          Quick Review
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No grammar rules found in your library yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="idioms" className="outline-none">
            <IdiomsBrowser />
          </TabsContent>

          <TabsContent value="practice" className="outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
              <Card 
                className="shadow-sm border-0 bg-white/80 backdrop-blur p-8 flex flex-col items-center justify-center space-y-4 hover:ring-2 hover:ring-highlight transition-all cursor-pointer relative"
                onClick={() => startPractice("Vocabulary Review")}
              >
                <div className="bg-highlight/10 p-4 rounded-full">
                  <Award className="h-10 w-10 text-highlight" />
                </div>
                <h3 className="text-xl font-display font-bold">Vocabulary Review</h3>
                <p className="text-muted-foreground text-sm">Test your memory with Dutch-Farsi word cards and exercises.</p>
                <Button className="rounded-xl px-8 w-full" disabled={isTyping}>
                  {isTyping ? "Generating..." : "Start Session"}
                </Button>
              </Card>
              <Card 
                className="shadow-sm border-0 bg-white/80 backdrop-blur p-8 flex flex-col items-center justify-center space-y-4 hover:ring-2 hover:ring-highlight transition-all cursor-pointer relative"
                onClick={() => startPractice("V2 Word Order")}
              >
                <div className="bg-primary/10 p-4 rounded-full">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold">Sentence Builder</h3>
                <p className="text-muted-foreground text-sm">Practice the V2 rule by reordering sentences.</p>
                <Button className="rounded-xl px-8 w-full" disabled={isTyping}>
                  {isTyping ? "Generating..." : "Start Session"}
                </Button>
              </Card>
              <Card 
                className="shadow-sm border-0 bg-white/80 backdrop-blur p-8 flex flex-col items-center justify-center space-y-4 hover:ring-2 hover:ring-highlight transition-all cursor-pointer relative"
                onClick={() => startPractice("Articles De vs Het")}
              >
                <div className="bg-orange-500/10 p-4 rounded-full">
                  <BookOpen className="h-10 w-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-display font-bold">Articles (De/Het)</h3>
                <p className="text-muted-foreground text-sm">Master the tricky Dutch definite articles.</p>
                <Button className="rounded-xl px-8 w-full" disabled={isTyping}>
                  {isTyping ? "Generating..." : "Start Session"}
                </Button>
              </Card>
              <Card 
                className="shadow-sm border-0 bg-white/80 backdrop-blur p-8 flex flex-col items-center justify-center space-y-4 hover:ring-2 hover:ring-highlight transition-all cursor-pointer relative"
                onClick={() => startPractice("Negation Niet vs Geen")}
              >
                <div className="bg-red-500/10 p-4 rounded-full">
                  <Sparkles className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-xl font-display font-bold">Negation</h3>
                <p className="text-muted-foreground text-sm">Learn when to use 'niet' and when to use 'geen'.</p>
                <Button className="rounded-xl px-8 w-full" disabled={isTyping}>
                  {isTyping ? "Generating..." : "Start Session"}
                </Button>
              </Card>
              <Card 
                className="shadow-sm border-0 bg-white/80 backdrop-blur p-8 flex flex-col items-center justify-center space-y-4 hover:ring-2 hover:ring-highlight transition-all cursor-pointer relative"
                onClick={() => startPractice("Verb Conjugation Present Tense")}
              >
                <div className="bg-emerald-500/10 p-4 rounded-full">
                  <HistoryIcon className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-display font-bold">Verb Conjugation</h3>
                <p className="text-muted-foreground text-sm">Practice regular and irregular verbs in the present tense.</p>
                <Button className="rounded-xl px-8 w-full" disabled={isTyping}>
                  {isTyping ? "Generating..." : "Start Session"}
                </Button>
              </Card>
              <Card 
                className="shadow-sm border-0 bg-white/80 backdrop-blur p-8 flex flex-col items-center justify-center space-y-4 hover:ring-2 hover:ring-highlight transition-all cursor-pointer relative"
                onClick={() => startPractice("Plurals")}
              >
                <div className="bg-purple-500/10 p-4 rounded-full">
                  <Layers className="h-10 w-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-display font-bold">Plurals</h3>
                <p className="text-muted-foreground text-sm">Practice forming plural nouns with -en and -s.</p>
                <Button className="rounded-xl px-8 w-full" disabled={isTyping}>
                  {isTyping ? "Generating..." : "Start Session"}
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="outline-none">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur p-8">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Profile</CardTitle>
                <CardDescription>Manage your account settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{user?.email}</h3>
                    <p className="text-muted-foreground text-sm">Learner</p>
                  </div>
                </div>
                <Button variant="destructive" onClick={() => auth.signOut()}>Sign Out</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {isPracticing && (
        <PracticeEngine 
          exercises={activeExercises} 
          onComplete={handlePracticeComplete} 
          onClose={() => setIsPracticing(false)} 
        />
      )}
    </div>
  );
}

export default App;
