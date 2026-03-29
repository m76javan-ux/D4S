import * as React from "react";
import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GrammarRule {
  id: string;
  dutch: string;
  farsi: string;
  explanation: string;
  examples?: string[] | string;
  commonMistakes?: { dutch: string; farsi: string; correction: string }[];
  [key: string]: any;
}

interface GrammarEditorProps {
  grammarRule: GrammarRule;
  onClose: () => void;
}

export function GrammarEditor({ grammarRule, onClose }: GrammarEditorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<GrammarRule>(grammarRule);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "grammar", formData.id);
      await updateDoc(docRef, { ...formData });

      toast({
        title: "Grammar Rule Updated",
        description: "The grammar rule has been updated in the database.",
      });
      onClose();
    } catch (error) {
      console.error("Failed to update grammar rule:", error);
      toast({
        title: "Error",
        description: "Failed to update grammar rule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Edit Grammar Rule</CardTitle>
        <CardDescription>Update the details for {formData.dutch}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Rule Name / Topic</Label>
          <Input value={formData.dutch} onChange={(e) => setFormData({...formData, dutch: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Farsi Explanation</Label>
          <Input value={formData.farsi} onChange={(e) => setFormData({...formData, farsi: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Explanation</Label>
          <Textarea value={formData.explanation} onChange={(e) => setFormData({...formData, explanation: e.target.value})} />
        </div>
        {/* Add fields for examples, commonMistakes, etc. as needed */}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={handleSubmit} disabled={loading} className="flex-1">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </CardFooter>
    </Card>
  );
}
