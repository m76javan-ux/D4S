import * as React from "react";
import { useUser, db } from "@/firebase";
import { collection, query, where, onSnapshot, type DocumentData } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  Award
} from "lucide-react";
// import { generateLesson, type GenerateLessonOutput } from "@/ai/flows/generate-lesson";
// import { aiGradeAnswer } from "@/ai/flows/ai-grade-answer";
import { updateLearnerProgress, completeLesson } from "@/firebase/learning-service";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export function LessonEngine() {
  const { user } = useUser();
  const [lesson, setLesson] = React.useState<any | null>(null); // Use any for now
  const [currentStep, setCurrentStep] = React.useState<"intro" | "grammar" | "examples" | "exercises" | "completed">("intro");
  const [exerciseIndex, setExerciseIndex] = React.useState(0);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [feedback, setFeedback] = React.useState<{ isCorrect: boolean; feedbackFa: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState<DocumentData | null>(null);

  React.useEffect(() => {
    if (!user) return;
    const progressRef = doc(db, 'users', user.uid, 'progress', 'current');
    return onSnapshot(progressRef, (snapshot) => {
      setProgress(snapshot.data() || null);
    });
  }, [user]);

  const startLesson = async (topic: string) => {
    setLoading(true);
    try {
      // Mocked lesson generation
      setLesson({
        title: topic,
        introduction: "This is a mock lesson.",
        grammarPoint: "This is a mock grammar point.",
        examples: [],
        exercises: []
      });
      setCurrentStep("intro");
    } catch (error) {
      console.error("Lesson generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnswer = async () => {
    if (!lesson || !user) return;
    setLoading(true);
    const exercise = lesson.exercises[exerciseIndex];
    try {
      // Mocked grading
      setFeedback({ isCorrect: true, feedbackFa: "Correct!" });
      await updateLearnerProgress(db, user.uid, "grammar", true);
    } catch (error) {
      console.error("Grading failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextExercise = () => {
    if (!lesson) return;
    if (exerciseIndex < lesson.exercises.length - 1) {
      setExerciseIndex(exerciseIndex + 1);
      setUserAnswer("");
      setFeedback(null);
    } else {
      setCurrentStep("completed");
      if (user && lesson) completeLesson(db, user.uid, lesson.title);
    }
  };

  if (loading && !lesson) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <div className="relative">
          <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <Sparkles className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Creating your lesson...</h3>
          <p className="text-muted-foreground">Our AI teacher is tailoring content to your level.</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    const topics = [
      { id: "v2", title: "V2 Word Order", icon: BrainCircuit, description: "Master the most important rule in Dutch grammar." },
      { id: "dehet", title: "De vs Het", icon: Languages, description: "Learn which article to use for every noun." },
      { id: "coffee", title: "Ordering Coffee", icon: BookOpen, description: "Practical Dutch for your next cafe visit." },
    ];

    return (
      <div className="grid gap-6 md:grid-cols-3">
        {topics.map((topic) => (
          <Card key={topic.id} className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <topic.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">{topic.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">{topic.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => startLesson(topic.title)} className="w-full font-bold">
                Start Lesson
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case "intro":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-4 rounded-2xl bg-muted/50 p-6 border-l-4 border-primary">
              <h3 className="text-2xl font-bold text-primary">Introduction</h3>
              <div className="prose prose-lg dark:prose-invert">
                <ReactMarkdown>{lesson.introduction}</ReactMarkdown>
              </div>
            </div>
            <Button onClick={() => setCurrentStep("grammar")} className="h-12 w-full text-lg font-bold shadow-lg">
              Next: Grammar Explanation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        );
      case "grammar":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-4 rounded-2xl bg-primary/5 p-6 border-2 border-primary/20">
              <h3 className="flex items-center gap-2 text-2xl font-bold text-primary">
                <BrainCircuit className="h-6 w-6" />
                Grammar Point
              </h3>
              <div className="prose prose-lg dark:prose-invert font-medium leading-relaxed">
                <ReactMarkdown>{lesson.grammarPoint}</ReactMarkdown>
              </div>
            </div>
            <Button onClick={() => setCurrentStep("examples")} className="h-12 w-full text-lg font-bold shadow-lg">
              Next: Examples
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        );
      case "examples":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h3 className="text-2xl font-bold">Examples</h3>
            <div className="grid gap-4">
              {lesson.examples.map((ex, i) => (
                <Card key={i} className="border-2 transition-all hover:bg-muted/30">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-primary">{ex.dutch}</p>
                      <p className="text-muted-foreground">{ex.farsi}</p>
                      {ex.phonetic && <p className="text-xs italic text-primary/60">{ex.phonetic}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                      <Volume2 className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button onClick={() => setCurrentStep("exercises")} className="h-12 w-full text-lg font-bold shadow-lg">
              Next: Practice Exercises
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        );
      case "exercises":
        const exercise = lesson.exercises[exerciseIndex];
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">Exercise {exerciseIndex + 1} of {lesson.exercises?.length || 0}</h3>
                <Progress value={(exerciseIndex / (lesson.exercises?.length || 1)) * 100} className="h-2 w-48" />
              </div>
              <Badge variant="outline" className="h-8 px-4 text-sm font-bold uppercase tracking-wider">
                {exercise.type}
              </Badge>
            </div>

            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-muted/30 pb-8">
                <CardTitle className="text-2xl font-medium leading-relaxed text-center">
                  {exercise.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                {exercise.type === "multiple-choice" ? (
                  <RadioGroup value={userAnswer} onValueChange={setUserAnswer} className="grid gap-4">
                    {exercise.options?.map((opt) => (
                      <div key={opt} className="flex items-center space-x-3 rounded-xl border-2 p-4 transition-all hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                        <RadioGroupItem value={opt} id={opt} />
                        <Label htmlFor={opt} className="flex-1 cursor-pointer text-lg font-medium">{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="h-14 text-xl font-medium border-2 focus-visible:ring-primary"
                  />
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4 border-t bg-muted/10 p-6">
                {!feedback ? (
                  <Button 
                    onClick={handleCheckAnswer} 
                    disabled={!userAnswer || loading} 
                    className="h-14 w-full text-lg font-bold shadow-lg"
                  >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                    Check Answer
                  </Button>
                ) : (
                  <div className={cn(
                    "flex w-full flex-col gap-4 rounded-xl p-6 border-2",
                    feedback.isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                  )}>
                    <div className="flex items-center gap-3">
                      {feedback.isCorrect ? (
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-600" />
                      )}
                      <div>
                        <p className={cn("text-lg font-bold", feedback.isCorrect ? "text-emerald-800" : "text-red-800")}>
                          {feedback.isCorrect ? "Goed gedaan! (آفرین)" : "Niet helemaal... (دوباره سعی کن)"}
                        </p>
                        <p className="text-sm font-medium opacity-80">{feedback.feedbackFa}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={nextExercise} 
                      className={cn(
                        "h-12 w-full font-bold shadow-md",
                        feedback.isCorrect ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                      )}
                    >
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        );
      case "completed":
        return (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-8 py-12 text-center">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/20" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary shadow-2xl">
                <Award className="h-16 w-16 text-primary-foreground" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black tracking-tight">Lesson Completed!</h3>
              <p className="text-xl text-muted-foreground">You've earned <span className="font-bold text-primary">50 XP</span> and mastered <span className="font-bold text-primary">{lesson.title}</span>.</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setLesson(null)} size="lg" className="h-14 px-8 text-lg font-bold shadow-xl">
                Back to Lessons
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold border-2">
                Share Achievement
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {lesson && (
        <div className="flex items-center justify-between border-b pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-primary">{lesson.title}</h2>
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1"><Heart className="h-4 w-4 text-red-500 fill-red-500" /> {progress?.hearts} Hearts</span>
              <span className="flex items-center gap-1"><Zap className="h-4 w-4 text-blue-500 fill-blue-500" /> {progress?.xp} XP</span>
            </div>
          </div>
          <Button variant="ghost" onClick={() => setLesson(null)} className="h-10 font-bold hover:bg-destructive/10 hover:text-destructive">
            Quit Lesson
          </Button>
        </div>
      )}
      {renderStep()}
    </div>
  );
}

// Helper to get doc ref
import { doc } from "firebase/firestore";
