import * as React from "react";
import { useUser, db, auth } from "@/firebase";
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
import { cn } from "@/lib/utils";
import { speakDutch } from "@/services/speechService";
import { GrammarCreator } from "./grammar-creator";
import { GrammarEditor } from "./grammar-editor";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

export function GrammarBrowser() {
  const [grammar, setGrammar] = React.useState<DocumentData[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [showCreator, setShowCreator] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedGrammar, setSelectedGrammar] = React.useState<DocumentData | null>(null);

  React.useEffect(() => {
    const q = query(collection(db, "grammar"), orderBy("title", "asc"));
    return onSnapshot(q, (snapshot) => {
      setGrammar(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, []);

  const filtered = grammar.filter(g => 
    g.title.toLowerCase().includes(search.toLowerCase()) || 
    g.explanation.toLowerCase().includes(search.toLowerCase()) ||
    (g.farsi && g.farsi.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Grammar</h2>
        <Button onClick={() => setShowCreator(!showCreator)}>
          {showCreator ? "Hide Creator" : "Add New Rule"}
        </Button>
      </div>
      {showCreator && <GrammarCreator />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search grammar rules..."
            className="h-11 pl-10 border-2"
          />
        </div>
        <div className="flex gap-2">
          {user?.email === "amo@gemarineerd.me" && (
            <>
              <Button 
                variant="secondary" 
                className="h-11 border-2 font-bold"
                onClick={async () => {
                  const token = await auth.currentUser?.getIdToken();
                  const response = await fetch("/api/update-grammar-phonetics", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                  });
                  const data = await response.json();
                  toast({ title: "Update", description: data.message });
                }}
              >
                Update Grammar Phonetics
              </Button>
              <Button 
                variant="secondary" 
                className="h-11 border-2 font-bold"
                onClick={async () => {
                  const token = await auth.currentUser?.getIdToken();
                  toast({ title: "Analyzing...", description: "Generating detailed explanations..." });
                  const response = await fetch("/api/update-grammar-explanations", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                  });
                  const data = await response.json();
                  toast({ title: "Update", description: data.message });
                }}
              >
                Generate Detailed Explanations
              </Button>
            </>
          )}
          <Button variant="outline" className="h-11 border-2 font-bold">
            <Filter className="mr-2 h-4 w-4" />
            Filter Level
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedGrammar(g)}
          >
            <Card className="group h-full border-2 transition-all hover:border-primary hover:shadow-xl cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {g.level || "A1"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl font-bold">{g.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                  {g.explanation}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="link" className="h-auto p-0 font-bold text-primary">
                  Read Explanation
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedGrammar} onOpenChange={(open) => !open && setSelectedGrammar(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{selectedGrammar?.title}</DialogTitle>
              {selectedGrammar?.dutch && (
                <Button variant="ghost" size="icon" onClick={() => speakDutch(selectedGrammar.dutch)}>
                  <Volume2 className="h-5 w-5" />
                </Button>
              )}
            </div>
            <DialogDescription className="text-base">
              {selectedGrammar?.explanation}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {isEditing ? (
              <GrammarEditor grammarRule={selectedGrammar as any} onClose={() => setIsEditing(false)} />
            ) : (
              <>
                <div className="flex justify-end">
                  <Button onClick={() => setIsEditing(true)}>Edit Rule</Button>
                </div>
                {selectedGrammar?.farsi && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Farsi Translation</h4>
                    <p className="text-lg">{selectedGrammar.farsi}</p>
                  </div>
                )}
                {selectedGrammar?.examples && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Examples</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {Array.isArray(selectedGrammar.examples) ? (
                        selectedGrammar.examples.map((ex: any, i: number) => (
                          <li key={i} className="text-lg">
                            {typeof ex === 'string' ? ex : (
                              <div className="space-y-1">
                                <p>{ex.dutch}</p>
                                {ex.phonetic && <p className="text-sm text-muted-foreground rtl">{ex.phonetic}</p>}
                              </div>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="text-lg">{selectedGrammar.examples}</li>
                      )}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
