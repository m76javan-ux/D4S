import * as React from "react";
import { useUser, db } from "@/firebase";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileText, 
  Loader2,
  Database,
  FileUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PdfImporter() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [configType, setConfigType] = React.useState("pdf_wordlists");
  const [category, setCategory] = React.useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !user) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("configType", configType);
      formData.append("category", category);

      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract PDF");
      }

      const { data } = await response.json();

      for (const item of data) {
        if (configType === "grammar_ocr") {
          await addDoc(collection(db, "grammar"), {
            rule: item.rule,
            farsiExplanation: item.farsiExplanation,
            detailedExplanation: item.detailedExplanation || "",
            createdBy: user.uid,
            createdAt: serverTimestamp()
          });
        } else {
          await addDoc(collection(db, "vocabulary"), {
            dutch: item.nl,
            farsi: item.fa,
            english: item.en,
            article: item.article || "",
            category: item.category,
            level: item.level,
            createdBy: user.uid,
            createdAt: serverTimestamp()
          });
        }
      }

      toast({
        title: "Import Successful",
        description: `Extracted and added ${data?.length || 0} items to the database.`,
      });
      setFile(null);
      setCategory("");
    } catch (error) {
      console.error("Import failed:", error);
      toast({
        title: "Import Failed",
        description: "Please check your PDF file and configuration.",
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
          <FileUp className="h-5 w-5 text-primary" />
          <CardTitle>Universal Vocabulary Extractor</CardTitle>
        </div>
        <CardDescription>Upload a PDF wordlist to extract, translate to Farsi, and add to your vocabulary database.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pdf-file">PDF File</Label>
          <Input id="pdf-file" type="file" accept="application/pdf" onChange={handleFileChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="config-type">Format Type</Label>
          <Select value={configType} onValueChange={setConfigType}>
            <SelectTrigger id="config-type">
              <SelectValue placeholder="Select format type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf_wordlists">Standard Wordlist (English - Dutch [gender])</SelectItem>
              <SelectItem value="gcse_list">GCSE List ("Dutch","English")</SelectItem>
              <SelectItem value="grammar_ocr">Grammar Rules (Gemini OCR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category (Optional)</Label>
          <Input 
            id="category" 
            placeholder="e.g., Pharmacy, Hotel, Zoo" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleImport} disabled={!file || loading} className="w-full font-bold">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Extract & Translate
        </Button>
      </CardFooter>
    </Card>
  );
}
