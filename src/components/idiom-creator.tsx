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

export function IdiomCreator() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    dutch: "",
    farsi: "",
    literalMeaning: "",
    exampleSentence: "",
    theme: ""
  });

  const handleSubmit = async () => {
    if (!formData.dutch || !formData.farsi || !user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "idioms"), {
        ...formData,
        type: "idiom",
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });

      toast({
        title: "Idiom Added",
        description: "Your idiom has been added to the database.",
      });
      setFormData({ dutch: "", farsi: "", literalMeaning: "", exampleSentence: "", theme: "" });
    } catch (error) {
      console.error("Failed to add idiom:", error);
      toast({
        title: "Error",
        description: "Failed to add idiom. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Add New Idiom</CardTitle>
        <CardDescription>Share a new Dutch idiom with the community.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Dutch Phrasing</Label>
          <Input value={formData.dutch} onChange={(e) => setFormData({...formData, dutch: e.target.value})} placeholder="e.g., iets in de oren knopen" />
        </div>
        <div className="space-y-2">
          <Label>Farsi Translation</Label>
          <Input value={formData.farsi} onChange={(e) => setFormData({...formData, farsi: e.target.value})} placeholder="e.g., چیزی را به خاطر سپردن" />
        </div>
        <div className="space-y-2">
          <Label>Literal Meaning</Label>
          <Input value={formData.literalMeaning} onChange={(e) => setFormData({...formData, literalMeaning: e.target.value})} placeholder="e.g., to knot something in the ears" />
        </div>
        <div className="space-y-2">
          <Label>Example Sentence</Label>
          <Textarea value={formData.exampleSentence} onChange={(e) => setFormData({...formData, exampleSentence: e.target.value})} placeholder="e.g., Knoop dat goed in je oren!" />
        </div>
        <div className="space-y-2">
          <Label>Theme (Optional)</Label>
          <Input value={formData.theme} onChange={(e) => setFormData({...formData, theme: e.target.value})} placeholder="e.g., Advice" />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={!formData.dutch || !formData.farsi || loading} className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add Idiom
        </Button>
      </CardFooter>
    </Card>
  );
}
