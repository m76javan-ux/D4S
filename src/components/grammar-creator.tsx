import * as React from "react";
import { useUser, db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function GrammarCreator() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    dutch: "",
    farsi: "",
    explanation: ""
  });

  const handleSubmit = async () => {
    if (!formData.dutch || !formData.farsi || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "grammar"), {
        ...formData,
        type: "grammar",
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });

      toast({
        title: "Grammar Rule Added",
        description: "Your grammar rule has been added to the database.",
      });
      setFormData({ dutch: "", farsi: "", explanation: "" });
    } catch (error) {
      console.error("Failed to add grammar rule:", error);
      toast({
        title: "Error",
        description: "Failed to add grammar rule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Add New Grammar Rule</CardTitle>
        <CardDescription>Add a new Dutch grammar rule.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Rule Name / Topic</Label>
          <Input value={formData.dutch} onChange={(e) => setFormData({...formData, dutch: e.target.value})} placeholder="e.g., V2 Word Order" />
        </div>
        <div className="space-y-2">
          <Label>Farsi Explanation</Label>
          <Input value={formData.farsi} onChange={(e) => setFormData({...formData, farsi: e.target.value})} placeholder="e.g., ترتیب کلمات در جمله" />
        </div>
        <div className="space-y-2">
          <Label>Explanation</Label>
          <Textarea value={formData.explanation} onChange={(e) => setFormData({...formData, explanation: e.target.value})} placeholder="e.g., The verb always comes second in a main clause." />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={!formData.dutch || !formData.farsi || loading} className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add Grammar Rule
        </Button>
      </CardFooter>
    </Card>
  );
}
