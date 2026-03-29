import * as React from "react";
import { errorEmitter } from "@/firebase/error-emitter";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

export function FirebaseErrorListener() {
  const { toast } = useToast();

  React.useEffect(() => {
    const handleError = (error: any) => {
      console.error("Firebase Global Error:", error);
      toast({
        title: "Database Error",
        description: error.message || "An unexpected error occurred with the database.",
        variant: "destructive",
      });
    };

    errorEmitter.on("error", handleError);
    return () => {
      errorEmitter.off("error", handleError);
    };
  }, [toast]);

  return null;
}
