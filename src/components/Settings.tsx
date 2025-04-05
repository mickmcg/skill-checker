import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from './ui/card'; // Add CardFooter
import Header from './Header';
import { Button } from './ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react'; // Import Loader2
import { Label } from './ui/label'; // Import Label
import { Input } from './ui/input'; // Import Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/use-toast';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserLocally } = useAuth(); // Get user and updateUserLocally from context
  const { toast } = useToast();

  // State for form values, initialized from user context or defaults
  const [numQuestions, setNumQuestions] = useState<number>(user?.default_num_questions ?? 10);
  const [difficulty, setDifficulty] = useState<string>(user?.default_difficulty ?? 'medium');
  const [timePerQuestion, setTimePerQuestion] = useState<number>(user?.default_time_per_question ?? 30);
  const [isSaving, setIsSaving] = useState(false); // Saving state

  // Update state if user data loads after initial render
  useEffect(() => {
    if (user) {
      setNumQuestions(user.default_num_questions ?? 10);
      setDifficulty(user.default_difficulty ?? 'medium');
      setTimePerQuestion(user.default_time_per_question ?? 30);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save settings.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          default_num_questions: numQuestions,
          default_difficulty: difficulty,
          default_time_per_question: timePerQuestion,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Default settings saved successfully.",
      });
      // Update local user state immediately
      updateUserLocally({
        default_num_questions: numQuestions,
        default_difficulty: difficulty,
        default_time_per_question: timePerQuestion,
      });

    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error Saving Settings",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow"> {/* Match HistorySection structure */}
        {/* Match HistorySection content wrapper */}
        <div className="w-full max-w-7xl mx-auto bg-card rounded-lg shadow-sm p-6 space-y-6">
          {/* Header section with back button and title */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)} // Navigate back
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1> {/* Styled title */}
            </div>
          </div>

          {/* Card for settings form */}
          <Card>
            <CardContent className="pt-6 space-y-4"> {/* Add spacing */}
              <h2 className="text-lg font-semibold mb-4">Default Quiz Settings</h2>
              {/* Number of Questions */}
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="num-questions" className="text-right">Number of Questions</Label>
                <Input
                  id="num-questions"
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value, 10) || 5)} // Ensure it's a number, default 5 if parse fails
                  min="5"
                  max="50"
                  className="col-span-2"
                />
              </div>
              {/* Difficulty */}
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="difficulty" className="text-right">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="col-span-2">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Time per Question */}
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="time-per-question" className="text-right">Time per Question (s)</Label>
                <Input
                  id="time-per-question"
                  type="number"
                  value={timePerQuestion}
                  onChange={(e) => setTimePerQuestion(parseInt(e.target.value, 10) || 15)} // Ensure number, default 15
                  min="15"
                  max="120"
                  step="5"
                  className="col-span-2"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Saving...' : 'Save Defaults'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
