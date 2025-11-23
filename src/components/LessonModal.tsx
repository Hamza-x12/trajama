import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Loader2, Trophy, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface Lesson {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
}

interface Exercise {
  id: string;
  question: string;
  correct_answer: string;
  options: string[];
}

interface LessonModalProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: () => void;
}

export const LessonModal = ({ lesson, onClose, onComplete }: LessonModalProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, [lesson.id]);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_exercises')
        .select('*')
        .eq('lesson_id', lesson.id)
        .order('order_index');

      if (error) throw error;
      
      // Parse options from JSON
      const parsedExercises = (data || []).map(ex => ({
        ...ex,
        options: Array.isArray(ex.options) ? ex.options : JSON.parse(ex.options as string)
      }));
      
      setExercises(parsedExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer');
      return;
    }

    const correct = selectedAnswer === exercises[currentIndex].correct_answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      await completeLesson();
    }
  };

  const completeLesson = async () => {
    setCompleting(true);
    try {
      const score = Math.round((correctCount / exercises.length) * 100);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to save progress');
        return;
      }

      // Save progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: session.user.id,
          lesson_id: lesson.id,
          completed: true,
          score,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (progressError) throw progressError;

      // Update profile XP
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp')
        .eq('id', session.user.id)
        .single();

      const newXp = (profile?.total_xp || 0) + lesson.xp_reward;

      const { error: xpError } = await supabase
        .from('profiles')
        .update({ total_xp: newXp })
        .eq('id', session.user.id);

      if (xpError) throw xpError;

      // Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success(`Lesson completed! +${lesson.xp_reward} XP`);
      onComplete();
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Failed to save progress');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (exercises.length === 0) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{lesson.title}</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No exercises available for this lesson yet.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentExercise = exercises[currentIndex];
  const progressPercent = ((currentIndex + 1) / exercises.length) * 100;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{lesson.title}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {currentIndex + 1} / {exercises.length}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <Progress value={progressPercent} className="mb-6" />

        {/* Question */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50">
            <p className="text-lg font-medium text-center">{currentExercise.question}</p>
          </div>

          {/* Answer Options */}
          <div className="grid gap-3">
            {currentExercise.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === currentExercise.correct_answer;
              
              let buttonClass = "w-full p-4 text-left border-2 transition-all duration-300 ";
              
              if (showResult) {
                if (isCorrectOption) {
                  buttonClass += "border-green-500 bg-green-500/10";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-500/10";
                } else {
                  buttonClass += "border-border bg-muted/50";
                }
              } else {
                buttonClass += isSelected
                  ? "border-primary bg-primary/10 shadow-moroccan"
                  : "border-border hover:border-primary/50 hover:bg-accent/5";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showResult && (
                      <>
                        {isCorrectOption && <Check className="w-5 h-5 text-green-500" />}
                        {isSelected && !isCorrect && <X className="w-5 h-5 text-red-500" />}
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Result Message */}
          {showResult && (
            <div className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
              isCorrect
                ? 'border-green-500 bg-green-500/10'
                : 'border-red-500 bg-red-500/10'
            }`}>
              {isCorrect ? (
                <>
                  <Sparkles className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-bold text-green-600 dark:text-green-400">Excellent!</p>
                    <p className="text-sm text-muted-foreground">That's correct!</p>
                  </div>
                </>
              ) : (
                <>
                  <X className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="font-bold text-red-600 dark:text-red-400">Not quite</p>
                    <p className="text-sm text-muted-foreground">
                      The correct answer is: <span className="font-semibold">{currentExercise.correct_answer}</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!showResult ? (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckAnswer}
                  disabled={!selectedAnswer}
                  className="flex-1"
                >
                  Check Answer
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                disabled={completing}
                className="w-full"
              >
                {completing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : currentIndex < exercises.length - 1 ? (
                  'Next Question'
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Complete Lesson
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Score Display */}
          <div className="text-center text-sm text-muted-foreground">
            Score: {correctCount} / {currentIndex + (showResult ? 1 : 0)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};