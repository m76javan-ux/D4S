import * as React from "react";
import { useUser, db } from "@/firebase";
import { collection, query, orderBy, onSnapshot, type DocumentData } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Languages, 
  Volume2, 
  Search, 
  Filter, 
  Star, 
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  History,
  Trash2,
  ChevronRight,
  HelpCircle,
  Info,
  CheckCircle2,
  XCircle,
  Award,
  Zap,
  Flame,
  LayoutDashboard,
  GraduationCap,
  Settings,
  User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { speakDutch } from "@/services/speechService";
import { cn } from "@/lib/utils";
import { WordCreator } from "./word-creator";
import { useToast } from "@/hooks/use-toast";

export function WordsBrowser() {
  const [words, setWords] = React.useState<DocumentData[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [showCreator, setShowCreator] = React.useState(false);

  React.useEffect(() => {
    const q = query(collection(db, "vocabulary"), orderBy("dutch", "asc"));
    return onSnapshot(q, (snapshot) => {
      setWords(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, []);

  const filtered = words.filter(w => 
    w.dutch.toLowerCase().includes(search.toLowerCase()) || 
    w.farsi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vocabulary</h2>
        <Button onClick={() => setShowCreator(!showCreator)}>
          {showCreator ? "Hide Creator" : "Add New Word"}
        </Button>
      </div>
      {showCreator && <WordCreator />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vocabulary..."
            className="h-11 pl-10 border-2"
          />
        </div>
        <Button variant="outline" className="h-11 border-2 font-bold">
          <Filter className="mr-2 h-4 w-4" />
          Filter Category
        </Button>
      </div>

      {search.trim() === "" ? (
        <div className="text-center text-muted-foreground py-10">
          Enter a search term to find words.
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">
          No words found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w, idx) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
            >
              <Card className="group border-2 transition-all hover:border-primary hover:shadow-lg">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-primary">{w.dutch}</p>
                      <p className="text-sm font-medium text-muted-foreground">{w.farsi}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-full"
                      onClick={() => speakDutch(w.dutch)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
