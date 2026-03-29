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
  ArrowRight
} from "lucide-react";
// import { aiTutorChat, type AiTutorChatInput } from "@/ai/flows/ai-tutor-chat";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { addDoc, serverTimestamp, deleteDoc, getDocs } from "firebase/firestore";
import ReactMarkdown from "react-markdown";

export function ChatTutor() {
  const { user } = useUser();
  const [messages, setMessages] = React.useState<DocumentData[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState<DocumentData | null>(null);

  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "chat_history"),
      orderBy("timestamp", "asc"),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  React.useEffect(() => {
    if (!user) return;
    const progressRef = doc(db, 'users', user.uid, 'progress', 'current');
    return onSnapshot(progressRef, (snapshot) => {
      setProgress(snapshot.data() || null);
    });
  }, [user]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage = input;
    setInput("");
    setIsTyping(true);

    try {
      await addDoc(collection(db, "users", user.uid, "chat_history"), {
        role: "user",
        content: userMessage,
        timestamp: serverTimestamp(),
      });

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

      await addDoc(collection(db, "users", user.uid, "chat_history"), {
        role: "model",
        content: data.answer || "I'm sorry, I couldn't process that.",
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Chat error:", error);
      await addDoc(collection(db, "users", user.uid, "chat_history"), {
        role: "model",
        content: "I'm sorry, the AI tutor is currently unavailable.",
        timestamp: serverTimestamp(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "chat_history"));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  };

  const suggestions = [
    { label: "Explain V2", icon: Sparkles },
    { label: "De or Het?", icon: Languages },
    { label: "Common Idioms", icon: BookOpen },
    { label: "Practice Speaking", icon: Volume2 },
  ];

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col border-2 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">D4S AI Tutor</CardTitle>
            <CardDescription className="text-xs">Your personal Dutch-Farsi mentor</CardDescription>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={clearHistory} 
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
                  <MessageSquare className="h-8 w-8 text-primary/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Hoe gaat het? (چطوری؟)</h3>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Ask me anything about Dutch grammar, vocabulary, or culture in Farsi or Dutch.
                  </p>
                </div>
                <div className="grid w-full max-w-sm grid-cols-2 gap-2">
                  {suggestions.map((s) => (
                    <Button
                      key={s.label}
                      variant="outline"
                      size="sm"
                      className="h-auto justify-start py-3 text-xs font-medium transition-all hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => setInput(s.label)}
                    >
                      <s.icon className="mr-2 h-3.5 w-3.5 text-primary" />
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex w-full gap-3",
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background"
                  )}>
                    {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
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
                    {m.intent && m.role === "model" && (
                      <Badge variant="secondary" className="w-fit bg-background/50 text-[10px] uppercase tracking-wider">
                        {m.intent}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="flex w-full gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                  <Bot className="h-4 w-4 text-primary" />
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
            placeholder="Type your message in Dutch or Farsi..."
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

// Helper to get doc ref
import { doc } from "firebase/firestore";
