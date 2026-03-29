import * as React from "react";
import { useUser, db } from "@/firebase";
import { doc, onSnapshot, type DocumentData } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Flame, 
  Heart, 
  BookOpen, 
  Target, 
  RefreshCw,
  Zap,
  TrendingUp,
  BrainCircuit,
  Award
} from "lucide-react";
import { refillHearts } from "@/firebase/learning-service";
import { motion, AnimatePresence } from "motion/react";

export function UserProfile() {
  const { user } = useUser();
  const [progress, setProgress] = React.useState<DocumentData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    const progressRef = doc(db, 'users', user.uid, 'progress', 'current');
    return onSnapshot(progressRef, (snapshot) => {
      setProgress(snapshot.data() || null);
      setLoading(false);
    });
  }, [user]);

  if (loading) return (
    <div className="flex h-48 w-full items-center justify-center">
      <RefreshCw className="h-8 w-8 animate-spin text-primary/50" />
    </div>
  );

  if (!progress) return (
    <Card className="border-dashed">
      <CardContent className="flex h-48 flex-col items-center justify-center gap-4">
        <BrainCircuit className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No progress data found. Start a lesson!</p>
      </CardContent>
    </Card>
  );

  const stats = [
    { label: "Level", value: progress.level, icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Streak", value: `${progress.streak} days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Hearts", value: progress.hearts, icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "XP", value: progress.xp, icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  const accuracies = [
    { label: "V2 Word Order", value: progress.v2Accuracy * 100, color: "bg-emerald-500" },
    { label: "De/Het Articles", value: progress.deHetAccuracy * 100, color: "bg-sky-500" },
    { label: "Vocabulary", value: progress.vocabAccuracy * 100, color: "bg-indigo-500" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                {stat.label === "Hearts" && progress.hearts < 5 && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-xs text-primary"
                    onClick={() => refillHearts(db, user!.uid)}
                  >
                    Refill Hearts
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Card className="col-span-full border-2 lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Skill Proficiency</CardTitle>
          </div>
          <CardDescription>Your mastery across core Dutch grammar and vocabulary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {accuracies.map((acc) => (
            <div key={acc.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{acc.label}</span>
                <span className="font-bold text-primary">{Math.round(acc.value)}%</span>
              </div>
              <Progress value={acc.value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="col-span-full border-2 lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Learning History</CardTitle>
          </div>
          <CardDescription>Summary of your recent achievements and focus areas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Words Learned</p>
                <p className="text-2xl font-bold">{progress.wordsLearned}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Award className="mr-1 h-3 w-3" />
              Top 10%
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Struggle Areas</p>
            <div className="flex flex-wrap gap-2">
              {progress.struggleAreas && progress.struggleAreas.length > 0 ? (
                progress.struggleAreas.map((area: string) => (
                  <Badge key={area} variant="outline" className="border-destructive/30 text-destructive">
                    {area}
                  </Badge>
                ))
              ) : (
                <p className="text-xs italic text-muted-foreground">No struggle areas identified yet. Keep practicing!</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
