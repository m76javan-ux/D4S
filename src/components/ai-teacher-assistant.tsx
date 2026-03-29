import * as React from "react";
import { useUser, db } from "@/firebase";
import { getAuth } from "firebase/auth";
import { collection, query, orderBy, limit, onSnapshot, type DocumentData } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  MessageSquare, 
  History, 
  Trash2,
  Volume2,
  Languages,
  BookOpen,
  ArrowRight,
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
  ChevronRight
} from "lucide-react";
// import { askTeacher, type AskTeacherInput } from "@/ai/flows/ai-teacher";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export function AiTeacherAssistant() {
  const { user } = useUser();
  const [progress, setProgress] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<{role: "user" | "model", content: string}[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "progress"), limit(1));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setProgress(snapshot.docs[0].data());
      }
    });
  }, [user]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch("/api/askAI", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ question: userMessage, history }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI Tutor");
      }

      const data = await response.json();

      setMessages((prev) => [...prev, { role: "model", content: data.answer || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error("Teacher error:", error);
      setMessages((prev) => [...prev, { role: "model", content: "I'm sorry, the teacher assistant is currently unavailable." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="flex h-[500px] flex-col border-2 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Ask the Teacher</CardTitle>
            <CardDescription className="text-xs">Instant explanations in Dutch & Farsi</CardDescription>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMessages([])} 
          className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 py-4">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
                  <HelpCircle className="h-8 w-8 text-primary/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">What's on your mind?</h3>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Ask about grammar rules, word usage, or cultural tips.
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex w-full gap-3",
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background"
                  )}>
                    {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <GraduationCap className="h-4 w-4 text-primary" />}
                  </div>
                  <div className={cn(
                    "flex max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm shadow-sm",
                    m.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-muted/50 border rounded-tl-none"
                  )}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="flex w-full gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-muted/50 px-4 py-3 border">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/40" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t bg-muted/30 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex w-full items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="h-12 border-2 bg-background focus-visible:ring-primary"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isTyping}
            className="h-12 w-12 shrink-0 rounded-xl shadow-lg transition-all active:scale-95"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
