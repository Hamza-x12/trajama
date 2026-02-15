import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useStreak } from "@/hooks/useStreak";
import { Flame, Trophy, Check, X, Clock } from "lucide-react";
import confetti from "canvas-confetti";

interface DictionaryEntry {
  darija: string;
  french: string;
  english: string;
  category: string;
}

interface DailyChallengeProps {
  entries: DictionaryEntry[];
}

// Deterministic daily seed from date
const getDailySeed = () => {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
};

// Simple seeded random
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
};

const formatTime = (ms: number) => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export function DailyChallenge({ entries }: DailyChallengeProps) {
  const { t } = useTranslation();
  const { streak, recordPractice, hasCompletedToday } = useStreak();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  // Timer for next challenge
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate today's quiz deterministically
  const quiz = useMemo(() => {
    if (entries.length < 4) return null;
    const seed = getDailySeed();
    const wordIndex = Math.floor(seededRandom(seed) * entries.length);
    const correctEntry = entries[wordIndex];

    // Pick 3 wrong answers
    const wrongOptions: string[] = [];
    let attempt = 1;
    while (wrongOptions.length < 3 && attempt < 100) {
      const idx = Math.floor(seededRandom(seed + attempt) * entries.length);
      const wrong = entries[idx].english;
      if (wrong !== correctEntry.english && !wrongOptions.includes(wrong)) {
        wrongOptions.push(wrong);
      }
      attempt++;
    }

    // Shuffle options
    const allOptions = [correctEntry.english, ...wrongOptions];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + i + 100) * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    return {
      word: correctEntry.darija,
      correctAnswer: correctEntry.english,
      options: allOptions,
      category: correctEntry.category,
    };
  }, [entries]);

  if (!quiz) return null;

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer) return; // Already answered
    setSelectedAnswer(answer);
    const correct = answer === quiz.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      await recordPractice();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#C1272D', '#006233', '#FFD700'],
      });
    }
  };

  return (
    <Card className="border-2 border-moroccan-gold/40 bg-gradient-to-br from-moroccan-gold/5 via-background to-moroccan-red/5 shadow-xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="text-2xl">🇲🇦</span>
            {t('dailyChallenge.title')}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 border-orange-500/50 text-orange-600 dark:text-orange-400">
              <Flame className="w-4 h-4" />
              <span className="font-bold">{streak.currentStreak}</span>
              <span className="text-xs">{t('dailyChallenge.days')}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 border-yellow-500/50 text-yellow-600 dark:text-yellow-400">
              <Trophy className="w-4 h-4" />
              <span className="font-bold">{streak.longestStreak}</span>
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{t('dailyChallenge.subtitle')}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasCompletedToday && !selectedAnswer ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">🌟</div>
            <p className="text-lg font-medium text-foreground">{t('dailyChallenge.alreadyCompleted')}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{t('dailyChallenge.nextChallenge')} {formatTime(timeLeft)}</span>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">{t('dailyChallenge.whatDoesItMean')}</p>
              <p className="text-4xl font-bold text-primary tracking-wide">{quiz.word}</p>
              <Badge variant="secondary" className="mt-2">{quiz.category}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quiz.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrectAnswer = option === quiz.correctAnswer;
                let variant: "default" | "outline" | "destructive" | "secondary" = "outline";
                let extraClass = "hover:bg-primary/10 hover:border-primary/50 transition-all h-auto py-3";

                if (selectedAnswer) {
                  if (isCorrectAnswer) {
                    extraClass = "bg-green-500/15 border-green-500 text-green-700 dark:text-green-400";
                  } else if (isSelected && !isCorrect) {
                    extraClass = "bg-red-500/15 border-red-500 text-red-700 dark:text-red-400";
                  } else {
                    extraClass = "opacity-50";
                  }
                }

                return (
                  <Button
                    key={idx}
                    variant={variant}
                    className={`text-base font-medium ${extraClass}`}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selectedAnswer}
                  >
                    <span className="flex items-center gap-2">
                      {selectedAnswer && isCorrectAnswer && <Check className="w-4 h-4 text-green-600" />}
                      {selectedAnswer && isSelected && !isCorrect && <X className="w-4 h-4 text-red-600" />}
                      {option}
                    </span>
                  </Button>
                );
              })}
            </div>

            {selectedAnswer && (
              <div className={`text-center p-3 rounded-lg ${isCorrect ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                {isCorrect ? (
                  <p className="font-medium">{t('dailyChallenge.correct')}</p>
                ) : (
                  <p className="font-medium">
                    {t('dailyChallenge.incorrect')} <span className="font-bold">{quiz.correctAnswer}</span>
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
