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

import { IdiomCreator } from "./idiom-creator";
import { useToast } from "@/hooks/use-toast";

export function IdiomsBrowser() {
  const [idioms, setIdioms] = React.useState<DocumentData[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [showCreator, setShowCreator] = React.useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  React.useEffect(() => {
    const q = query(collection(db, "idioms"), orderBy("dutch", "asc"));
    return onSnapshot(q, (snapshot) => {
      setIdioms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, []);

  const filtered = idioms.filter(i => 
    i.dutch.toLowerCase().includes(search.toLowerCase()) || 
    i.farsi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Idioms</h2>
        <Button onClick={() => setShowCreator(!showCreator)}>
          {showCreator ? "Hide Creator" : "Add New Idiom"}
        </Button>
      </div>
      {showCreator && <IdiomCreator />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search idioms..."
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
                  const response = await fetch("/api/generate-idiom-farsi", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                  });
                  const data = await response.json();
                  toast({ title: "Generate Farsi", description: data.message });
                }}
              >
                Generate Farsi Idioms
              </Button>
              <Button 
                variant="secondary" 
                className="h-11 border-2 font-bold"
                onClick={async () => {
                  const token = await auth.currentUser?.getIdToken();
                  const response = await fetch("/api/refine-idiom-farsi", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                  });
                  const data = await response.json();
                  toast({ title: "Refinement", description: data.message });
                }}
              >
                Refine Farsi Idioms
              </Button>
              <Button 
                variant="secondary" 
                className="h-11 border-2 font-bold"
                onClick={async () => {
                  const token = await auth.currentUser?.getIdToken();
                  const response = await fetch("/api/update-idiom-examples", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                  });
                  const data = await response.json();
                  toast({ title: "Update Examples", description: data.message });
                }}
              >
                Update Idiom Examples
              </Button>
            </>
          )}
          <Button variant="outline" className="h-11 border-2 font-bold">
            <Filter className="mr-2 h-4 w-4" />
            Filter Theme
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i, idx) => (
          <motion.div
            key={i.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="group h-full border-2 transition-all hover:border-primary hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {i.theme || "General"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl font-bold">{i.dutch}</CardTitle>
                <CardDescription className="text-sm font-medium leading-relaxed text-primary">
                  {i.farsi}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-3 text-xs italic leading-relaxed">
                  "{i.literal_meaning}"
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Example</p>
                  <p className="text-sm font-medium leading-relaxed">{i.example}</p>
                </div>

                {i.examples && i.examples.length > 0 && (
                  <div className="space-y-3 bg-muted/30 p-4 rounded-xl max-h-64 overflow-y-auto mt-4">
                    <h4 className="text-sm font-bold text-foreground">More Examples ({i.examples.length}):</h4>
                    {i.examples.map((ex: any, idx: number) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-border/50 pb-2 last:border-0 last:pb-0">
                        <span className="font-medium text-sm">{ex.dutch}</span>
                        <span className="text-xs text-muted-foreground rtl">{ex.farsi}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 flex-1 font-bold text-primary hover:bg-primary/10">
                  <Volume2 className="mr-2 h-4 w-4" />
                  Listen
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
