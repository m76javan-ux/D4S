import * as React from "react";
import { useUser, db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Database,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ContentImporter() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [jsonInput, setJsonInput] = React.useState("");

  const handleImport = async () => {
    if (!jsonInput.trim() || !user) return;
    setLoading(true);
    try {
      const data = JSON.parse(jsonInput);
      const batch = Array.isArray(data) ? data : [data];
      
      for (const item of batch) {
        const collectionName = item.type === 'word' ? 'vocabulary' : item.type === 'idiom' ? 'idioms' : 'grammar';
        await addDoc(collection(db, collectionName), {
          ...item,
          createdBy: user.uid,
          createdAt: serverTimestamp()
        });
      }

      toast({
        title: "Import Successful",
        description: `Imported ${batch.length} items to the database.`,
      });
      setJsonInput("");
    } catch (error) {
      console.error("Import failed:", error);
      toast({
        title: "Import Failed",
        description: "Please check your JSON format.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>Content Importer</CardTitle>
        </div>
        <CardDescription>Paste JSON data to populate the vocabulary, grammar, or idioms database.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='[{"type": "word", "dutch": "hallo", "farsi": "سلام"}, {"type": "idiom", "dutch": "iets in de oren knopen", "farsi": "چیزی را به خاطر سپردن"}]'
          className="min-h-[200px] w-full rounded-md border-2 bg-background p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleImport} disabled={!jsonInput.trim() || loading} className="w-full font-bold">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Import Content
        </Button>
      </CardFooter>
    </Card>
  );
}
