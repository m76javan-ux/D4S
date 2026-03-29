import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ChevronRight, 
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Mic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { SRSGrade } from "@/services/srs-service";
import { analyzePronunciation } from "@/services/pronunciationService";
import V2GuidedSlotExercisePro from "./V2GuidedSlotExercisePro";
import { classifyV2Mistake, MistakeType } from "@/lib/classifyV2Mistake";
import { auth } from "@/firebase";

export interface Exercise {
  id: string;
  type: 'flashcard' | 'mcq' | 'cloze' | 'reorder';
  subtype?: 'v2_guided_slots' | 'basic_reorder' | 'multiple_choice';
  question: string;
  answer: string;
  options?: string[];
  explanation?: string;
  dutch: string;
  farsi: string;
  level?: string;
  instruction?: string;
  hint?: string;
  tokens?: { id: string; text: string; role?: any }[];
  correctOrder?: string[];
}

interface PracticeEngineProps {
  exercises: Exercise[];
  onComplete: (results: { exerciseId: string; grade: SRSGrade }[]) => void;
  onClose: () => void;
}

export function PracticeEngine({ exercises, onComplete, onClose }: PracticeEngineProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [clozeInput, setClozeInput] = React.useState("");
  const [reorderItems, setReorderItems] = React.useState<string[]>([]);
  const [results, setResults] = React.useState<{ exerciseId: string; grade: SRSGrade }[]>([]);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [isListening, setIsListening] = React.useState(false);
  const [recognizedText, setRecognizedText] = React.useState("");
  
  // V2 Progression State
  const [v2Mistakes, setV2Mistakes] = React.useState<MistakeType[]>([]);
  const [v2CorrectStreak, setV2CorrectStreak] = React.useState(0);

  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex) / (exercises?.length || 1)) * 100;

  const startListening = (targetText?: string) => {
    const target = targetText || currentExercise.dutch;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'nl-NL';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setRecognizedText(text);
      const feedback = await analyzePronunciation(text, target);
      setRecognizedText(feedback);
      const isMatch = text.trim().toLowerCase() === target.trim().toLowerCase();
      setIsCorrect(isMatch);
      setShowAnswer(true);
    };

    recognition.start();
  };

  React.useEffect(() => {
    if (currentExercise?.type === 'reorder') {
      const items = currentExercise.answer.split(' ').sort(() => Math.random() - 0.5);
      setReorderItems(items);
    }
    setShowAnswer(false);
    setSelectedOption(null);
    setClozeInput("");
    setIsCorrect(null);
  }, [currentIndex, currentExercise]);

  const handleGrade = (grade: SRSGrade) => {
    const newResults = [...results, { exerciseId: currentExercise.id, grade }];
    setResults(newResults);

    if (currentIndex < (exercises?.length || 1) - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(newResults);
    }
  };

  const checkAnswer = () => {
    let correct = false;
    if (currentExercise.type === 'mcq') {
      correct = selectedOption === currentExercise.answer;
    } else if (currentExercise.type === 'cloze') {
      correct = clozeInput.trim().toLowerCase() === currentExercise.answer.toLowerCase();
    } else if (currentExercise.type === 'reorder') {
      correct = reorderItems.join(' ') === currentExercise.answer;
    }
    setIsCorrect(correct);
    setShowAnswer(true);
  };

  const renderExercise = () => {
    switch (currentExercise.type) {
      case 'flashcard':
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-8">
            <motion.div 
              animate={{ rotateY: showAnswer ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative w-full max-w-sm h-64 cursor-pointer preserve-3d"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              <div className={cn(
                "absolute inset-0 backface-hidden bg-white border-2 border-primary/20 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-xl",
                showAnswer && "pointer-events-none"
              )}>
                <Badge variant="outline" className="mb-4 text-highlight border-highlight">Dutch</Badge>
                <h2 className="text-3xl font-display font-bold text-primary">{currentExercise.dutch}</h2>
                <p className="mt-4 text-muted-foreground flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" /> Click to flip
                </p>
                <Button 
                  variant="outline" 
                  className={cn("mt-4", isListening && "animate-pulse bg-highlight text-white")}
                  onClick={(e) => { e.stopPropagation(); startListening(); }}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {isListening ? "Listening..." : "Speak"}
                </Button>
                {recognizedText && (
                  <p className="mt-2 text-xs text-muted-foreground text-center">{recognizedText}</p>
                )}
              </div>
              <div className="absolute inset-0 backface-hidden bg-primary text-white rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-xl rotate-y-180">
                <Badge variant="outline" className="mb-4 text-white/50 border-white/20">Farsi</Badge>
                <h2 className="text-3xl font-display font-bold dir-rtl">{currentExercise.farsi}</h2>
                {currentExercise.explanation && (
                  <p className="mt-4 text-sm text-white/70 italic">{currentExercise.explanation}</p>
                )}
              </div>
            </motion.div>

            {showAnswer && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full"
              >
                <Button variant="outline" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100" onClick={() => handleGrade('Again')}>Again</Button>
                <Button variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100" onClick={() => handleGrade('Hard')}>Hard</Button>
                <Button variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100" onClick={() => handleGrade('Good')}>Good</Button>
                <Button variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" onClick={() => handleGrade('Easy')}>Easy</Button>
              </motion.div>
            )}
          </div>
        );

      case 'mcq':
        return (
          <div className="space-y-6">
            <div className="text-center p-6 bg-muted/30 rounded-2xl border border-border relative">
              <Button
                variant="ghost"
                size="icon"
                className={cn("absolute right-2 top-2", isListening && "animate-pulse text-highlight")}
                onClick={() => startListening(currentExercise.answer)}
                disabled={showAnswer}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground mb-2">What is the translation of:</p>
              <h2 className="text-3xl font-display font-bold text-primary">{currentExercise.question}</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {currentExercise.options?.map((option, i) => (
                <Button
                  key={i}
                  variant={selectedOption === option ? (showAnswer ? (isCorrect ? "default" : "destructive") : "secondary") : "outline"}
                  className={cn(
                    "h-14 justify-start px-6 text-lg rounded-xl border-2 transition-all",
                    selectedOption === option && !showAnswer && "border-highlight bg-highlight/5",
                    showAnswer && option === currentExercise.answer && "border-green-500 bg-green-50 text-green-700",
                    showAnswer && selectedOption === option && !isCorrect && "border-red-500 bg-red-50 text-red-700"
                  )}
                  onClick={() => !showAnswer && setSelectedOption(option)}
                  disabled={showAnswer}
                >
                  <span className="mr-4 opacity-50 font-mono">{String.fromCharCode(65 + i)}</span>
                  {option}
                </Button>
              ))}
            </div>
            {!showAnswer ? (
              <Button 
                className="w-full h-12 rounded-xl text-lg font-bold" 
                disabled={!selectedOption}
                onClick={checkAnswer}
              >
                Check Answer
              </Button>
            ) : (
              <div className="space-y-4">
                <div className={cn(
                  "p-4 rounded-xl flex items-center gap-3",
                  isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                )}>
                  {isCorrect ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  <div>
                    <p className="font-bold">{isCorrect ? "Correct!" : "Feedback"}</p>
                    <p className="text-sm">{recognizedText}</p>
                    {!isCorrect && <p className="text-sm mt-2">The correct answer is: {currentExercise.answer}</p>}
                  </div>
                </div>
                <Button className="w-full h-12 rounded-xl" onClick={() => handleGrade(isCorrect ? 'Good' : 'Again')}>
                  Continue <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        );

      case 'reorder':
        if (currentExercise.subtype === 'v2_guided_slots' && currentExercise.tokens && currentExercise.correctOrder) {
          const v2ViolationsCount = v2Mistakes.filter(m => m === 'V2_VIOLATION').length;
          const isBeginnerMode = v2CorrectStreak < 3 || v2ViolationsCount >= 2;
          const isLockSlot2 = isBeginnerMode;
          const showGhostPattern = isBeginnerMode;

          return (
            <div className="space-y-8">
              <V2GuidedSlotExercisePro
                exercise={currentExercise as any}
                beginnerMode={isBeginnerMode}
                lockSlot2ToVerb={isLockSlot2}
                showGhostPattern={showGhostPattern}
                showRoleHints={true}
                canRevealAnswer={true}
                onComplete={async (result) => {
                  setIsCorrect(result.isCorrect);
                  setShowAnswer(true);

                  const mistake = classifyV2Mistake(result);
                  if (result.isCorrect) {
                    setV2CorrectStreak(prev => prev + 1);
                  } else {
                    setV2CorrectStreak(0);
                    setV2Mistakes(prev => [...prev, mistake].slice(-5));
                  }

                  try {
                    const token = await auth.currentUser?.getIdToken();
                    if (token) {
                      await fetch("/api/exercises/verify", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          exerciseId: currentExercise.id,
                          isCorrect: result.isCorrect,
                          userOrder: result.userOrder,
                          mistakeType: mistake
                        })
                      });
                    }
                  } catch (e) {
                    console.error("Failed to log exercise attempt", e);
                  }
                }}
              />
              {showAnswer && (
                <div className="space-y-4">
                  <Button className="w-full h-12 rounded-xl" onClick={() => handleGrade(isCorrect ? 'Good' : 'Again')}>
                    Continue <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="space-y-8">
            <div className="text-center p-6 bg-muted/30 rounded-2xl border border-border relative">
              <Button
                variant="ghost"
                size="icon"
                className={cn("absolute right-2 top-2", isListening && "animate-pulse text-highlight")}
                onClick={() => startListening(currentExercise.answer)}
                disabled={showAnswer}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground mb-2">Reorder the words to form the correct sentence:</p>
              <h2 className="text-2xl font-display font-medium dir-rtl">{currentExercise.question}</h2>
            </div>
            
            <div className="min-h-[100px] p-4 bg-background border-2 border-dashed border-border rounded-2xl flex flex-wrap gap-2 items-center justify-center">
              {reorderItems.map((word, i) => (
                <motion.div
                  layout
                  key={`${word}-${i}`}
                  className="px-4 py-2 bg-white border border-border rounded-xl shadow-sm cursor-pointer hover:border-highlight transition-colors"
                  onClick={() => {
                    if (showAnswer) return;
                    const newItems = [...reorderItems];
                    newItems.splice(i, 1);
                    setReorderItems([...newItems, word]); // This is a simple reorder logic for demo
                  }}
                >
                  {word}
                </motion.div>
              ))}
            </div>

            {!showAnswer ? (
              <Button className="w-full h-12 rounded-xl" onClick={checkAnswer}>Check Sentence</Button>
            ) : (
              <div className="space-y-4">
                <div className={cn(
                  "p-4 rounded-xl flex items-center gap-3",
                  isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                )}>
                  {isCorrect ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  <div>
                    <p className="font-bold">{isCorrect ? "Correct!" : "Incorrect"}</p>
                    {!isCorrect && <p className="text-sm">Correct order: {currentExercise.answer}</p>}
                  </div>
                </div>
                <Button className="w-full h-12 rounded-xl" onClick={() => handleGrade(isCorrect ? 'Good' : 'Again')}>
                  Continue <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        );

      case 'cloze':
        return (
          <div className="space-y-8">
            <div className="text-center p-6 bg-muted/30 rounded-2xl border border-border">
              <p className="text-sm text-muted-foreground mb-2">Fill in the blank:</p>
              <h2 className="text-2xl font-display font-medium mb-4">{currentExercise.question}</h2>
              <p className="text-muted-foreground text-sm dir-rtl">{currentExercise.farsi}</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={clozeInput}
                  onChange={(e) => setClozeInput(e.target.value)}
                  disabled={showAnswer}
                  placeholder="Type your answer here..."
                  className={cn(
                    "w-full h-14 px-6 text-xl rounded-xl border-2 bg-background transition-all outline-none",
                    !showAnswer ? "border-border focus:border-highlight" : (isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50")
                  )}
                  onKeyPress={(e) => e.key === 'Enter' && !showAnswer && clozeInput.trim() && checkAnswer()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("absolute right-2 top-1/2 -translate-y-1/2", isListening && "animate-pulse text-highlight")}
                  onClick={() => startListening(currentExercise.answer)}
                  disabled={showAnswer}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>

              {!showAnswer ? (
                <Button 
                  className="w-full h-12 rounded-xl text-lg font-bold" 
                  disabled={!clozeInput.trim()}
                  onClick={checkAnswer}
                >
                  Check Answer
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className={cn(
                    "p-4 rounded-xl flex items-center gap-3",
                    isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  )}>
                    {isCorrect ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                    <div>
                      <p className="font-bold">{isCorrect ? "Correct!" : "Feedback"}</p>
                      <p className="text-sm">{recognizedText}</p>
                      {!isCorrect && <p className="text-sm mt-2">The correct answer is: {currentExercise.answer}</p>}
                    </div>
                  </div>
                  <Button className="w-full h-12 rounded-xl" onClick={() => handleGrade(isCorrect ? 'Good' : 'Again')}>
                    Continue <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden rounded-3xl">
        <CardHeader className="bg-primary text-white pb-8">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
              <XCircle className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold opacity-70">Exercise {currentIndex + 1} of {exercises?.length || 0}</span>
            </div>
            <div className="w-10" />
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </CardHeader>
        
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderExercise()}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        {currentExercise.explanation && showAnswer && (
          <CardFooter className="bg-muted/30 p-6 border-t border-border">
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 text-highlight shrink-0" />
              <p className="text-sm text-muted-foreground italic">{currentExercise.explanation}</p>
            </div>
          </CardFooter>
        )}
      </Card>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .dir-rtl { direction: rtl; }
      `}} />
    </div>
  );
}
