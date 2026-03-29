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

export function WordCreator() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    dutch: "",
    farsi: "",
    category: ""
  });

  const handleSubmit = async () => {
    if (!formData.dutch || !formData.farsi || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "vocabulary"), {
        ...formData,
        type: "word",
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });

      toast({
        title: "Word Added",
        description: "Your word has been added to the database.",
      });
      setFormData({ dutch: "", farsi: "", category: "" });
    } catch (error) {
      console.error("Failed to add word:", error);
      toast({
        title: "Error",
        description: "Failed to add word. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Add New Word</CardTitle>
        <CardDescription>Add a new Dutch word to your vocabulary.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Dutch Word</Label>
          <Input value={formData.dutch} onChange={(e) => setFormData({...formData, dutch: e.target.value})} placeholder="e.g., hallo" />
        </div>
        <div className="space-y-2">
          <Label>Farsi Translation</Label>
          <Input value={formData.farsi} onChange={(e) => setFormData({...formData, farsi: e.target.value})} placeholder="e.g., سلام" />
        </div>
        <div className="space-y-2">
          <Label>Category (Optional)</Label>
          <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g., Greetings" />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={!formData.dutch || !formData.farsi || loading} className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add Word
        </Button>
      </CardFooter>
    </Card>
  );
}
