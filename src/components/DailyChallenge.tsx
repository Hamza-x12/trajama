import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useStreak } from "@/hooks/useStreak";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Trophy, Check, X, Clock, Volume2, Award, Crown, Medal } from "lucide-react";
import confetti from "canvas-confetti";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DictionaryEntry {
  darija: string;
  french: string;
  english: string;
  category: string;
}

interface DailyChallengeProps {
  entries: DictionaryEntry[];
}

interface LeaderboardEntry {
  display_name: string;
  avatar_url: string | null;
  total_score: number;
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

type ChallengeType = "multiple_choice" | "fill_in_blank" | "listening";

const POINTS: Record<ChallengeType, number> = {
  multiple_choice: 10,
  fill_in_blank: 15,
  listening: 20,
};

export function DailyChallenge({ entries }: DailyChallengeProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { streak, recordPractice, hasCompletedToday } = useStreak();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Timer for next challenge
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Determine challenge type from seed
  const challengeType: ChallengeType = useMemo(() => {
    const seed = getDailySeed();
    const types: ChallengeType[] = ["multiple_choice", "fill_in_blank", "listening"];
    return types[Math.floor(seededRandom(seed + 999) * 3)];
  }, []);

  // Generate today's quiz deterministically
  const quiz = useMemo(() => {
    if (entries.length < 4) return null;
    const seed = getDailySeed();
    const wordIndex = Math.floor(seededRandom(seed) * entries.length);
    const correctEntry = entries[wordIndex];

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

    const allOptions = [correctEntry.english, ...wrongOptions];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + i + 100) * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    return {
      word: correctEntry.darija,
      english: correctEntry.english,
      correctAnswer: correctEntry.english,
      options: allOptions,
      category: correctEntry.category,
    };
  }, [entries]);

  // Load leaderboard
  const loadLeaderboard = useCallback(async () => {
    if (!user) return;
    setLoadingLeaderboard(true);
    try {
      const { data, error } = await supabase.rpc('get_leaderboard');
      if (!error && data) {
        setLeaderboard(data as LeaderboardEntry[]);
      }
    } catch {
      // ignore
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [user]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Save score to database
  const saveScore = useCallback(async (type: ChallengeType, points: number) => {
    if (!user) return;
    await supabase.from('challenge_scores').insert({
      user_id: user.id,
      score: points,
      challenge_type: type,
      challenge_date: new Date().toISOString().split('T')[0],
    });
    loadLeaderboard();
  }, [user, loadLeaderboard]);

  // Play word via SpeechSynthesis
  const speakWord = useCallback((word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "ar-MA";
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }, []);

  if (!quiz) return null;

  const handleMultipleChoice = async (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const correct = answer === quiz.correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      await recordPractice();
      await saveScore(challengeType, POINTS[challengeType]);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#C1272D', '#006233', '#FFD700'] });
    }
  };

  const handleFillSubmit = async () => {
    if (selectedAnswer) return;
    const answer = fillAnswer.trim().toLowerCase();
    const correct = answer === quiz.correctAnswer.toLowerCase();
    setSelectedAnswer(fillAnswer);
    setIsCorrect(correct);
    if (correct) {
      await recordPractice();
      await saveScore("fill_in_blank", POINTS.fill_in_blank);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#C1272D', '#006233', '#FFD700'] });
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 text-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
  };

  const renderChallenge = () => {
    if (hasCompletedToday && !selectedAnswer) {
      return (
        <div className="text-center py-6 space-y-3">
          <div className="text-4xl">🌟</div>
          <p className="text-lg font-medium text-foreground">{t('dailyChallenge.alreadyCompleted')}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{t('dailyChallenge.nextChallenge')} {formatTime(timeLeft)}</span>
          </div>
        </div>
      );
    }

    switch (challengeType) {
      case "fill_in_blank":
        return (
          <>
            <div className="text-center py-4">
              <Badge variant="secondary" className="mb-2">
                {t('dailyChallenge.fillInBlank')}
              </Badge>
              <p className="text-sm text-muted-foreground mb-2">{t('dailyChallenge.typeAnswer')}</p>
              <p className="text-4xl font-bold text-primary tracking-wide">{quiz.word}</p>
              <Badge variant="outline" className="mt-2">{quiz.category}</Badge>
            </div>
            <div className="flex gap-2">
              <Input
                value={fillAnswer}
                onChange={(e) => setFillAnswer(e.target.value)}
                placeholder={t('dailyChallenge.typeAnswer')}
                disabled={!!selectedAnswer}
                onKeyDown={(e) => e.key === 'Enter' && handleFillSubmit()}
                className="flex-1"
              />
              <Button onClick={handleFillSubmit} disabled={!!selectedAnswer || !fillAnswer.trim()}>
                <Check className="w-4 h-4" />
              </Button>
            </div>
            {selectedAnswer && (
              <div className={`text-center p-3 rounded-lg ${isCorrect ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                {isCorrect ? (
                  <p className="font-medium">{t('dailyChallenge.correct')} (+{POINTS.fill_in_blank} {t('dailyChallenge.points')})</p>
                ) : (
                  <p className="font-medium">{t('dailyChallenge.incorrect')} <span className="font-bold">{quiz.correctAnswer}</span></p>
                )}
              </div>
            )}
          </>
        );

      case "listening":
        return (
          <>
            <div className="text-center py-4">
              <Badge variant="secondary" className="mb-3">
                {t('dailyChallenge.listeningChallenge')}
              </Badge>
              <p className="text-sm text-muted-foreground mb-3">{t('dailyChallenge.listen')}</p>
              <Button
                variant="outline"
                size="lg"
                onClick={() => speakWord(quiz.word)}
                className="gap-2 text-lg px-8 py-6 border-primary/30 hover:bg-primary/10"
              >
                <Volume2 className="w-6 h-6 text-primary" />
                {t('dailyChallenge.replay')}
              </Button>
              <Badge variant="outline" className="mt-3 block mx-auto w-fit">{quiz.category}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quiz.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrectAnswer = option === quiz.correctAnswer;
                let extraClass = "hover:bg-primary/10 hover:border-primary/50 transition-all h-auto py-3";
                if (selectedAnswer) {
                  if (isCorrectAnswer) extraClass = "bg-green-500/15 border-green-500 text-green-700 dark:text-green-400";
                  else if (isSelected && !isCorrect) extraClass = "bg-red-500/15 border-red-500 text-red-700 dark:text-red-400";
                  else extraClass = "opacity-50";
                }
                return (
                  <Button key={idx} variant="outline" className={`text-base font-medium ${extraClass}`} onClick={() => handleMultipleChoice(option)} disabled={!!selectedAnswer}>
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
                  <p className="font-medium">{t('dailyChallenge.correct')} (+{POINTS.listening} {t('dailyChallenge.points')})</p>
                ) : (
                  <p className="font-medium">{t('dailyChallenge.incorrect')} <span className="font-bold">{quiz.correctAnswer}</span></p>
                )}
              </div>
            )}
          </>
        );

      default: // multiple_choice
        return (
          <>
            <div className="text-center py-4">
              <Badge variant="secondary" className="mb-2">
                {t('dailyChallenge.multipleChoice')}
              </Badge>
              <p className="text-sm text-muted-foreground mb-2">{t('dailyChallenge.whatDoesItMean')}</p>
              <p className="text-4xl font-bold text-primary tracking-wide">{quiz.word}</p>
              <Badge variant="outline" className="mt-2">{quiz.category}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quiz.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrectAnswer = option === quiz.correctAnswer;
                let extraClass = "hover:bg-primary/10 hover:border-primary/50 transition-all h-auto py-3";
                if (selectedAnswer) {
                  if (isCorrectAnswer) extraClass = "bg-green-500/15 border-green-500 text-green-700 dark:text-green-400";
                  else if (isSelected && !isCorrect) extraClass = "bg-red-500/15 border-red-500 text-red-700 dark:text-red-400";
                  else extraClass = "opacity-50";
                }
                return (
                  <Button key={idx} variant="outline" className={`text-base font-medium ${extraClass}`} onClick={() => handleMultipleChoice(option)} disabled={!!selectedAnswer}>
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
                  <p className="font-medium">{t('dailyChallenge.correct')} (+{POINTS.multiple_choice} {t('dailyChallenge.points')})</p>
                ) : (
                  <p className="font-medium">{t('dailyChallenge.incorrect')} <span className="font-bold">{quiz.correctAnswer}</span></p>
                )}
              </div>
            )}
          </>
        );
    }
  };

  return (
    <Card className="border-2 border-moroccan-gold/40 bg-gradient-to-br from-moroccan-gold/5 via-background to-moroccan-red/5 shadow-xl overflow-hidden">
      <Tabs defaultValue="challenge">
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t('dailyChallenge.subtitle')}</p>
            {user && (
              <TabsList className="h-8">
                <TabsTrigger value="challenge" className="text-xs px-3 h-7">
                  <Award className="w-3 h-3 mr-1" />
                  {t('dailyChallenge.title')}
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="text-xs px-3 h-7">
                  <Trophy className="w-3 h-3 mr-1" />
                  {t('dailyChallenge.leaderboard')}
                </TabsTrigger>
              </TabsList>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <TabsContent value="challenge" className="mt-0 space-y-4">
            {renderChallenge()}
          </TabsContent>

          {user && (
            <TabsContent value="leaderboard" className="mt-0">
              <div className="space-y-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  {t('dailyChallenge.topPlayers')}
                </h3>
                {loadingLeaderboard ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">Loading...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    {t('dailyChallenge.noScoresYet')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${index === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-muted/30'}`}>
                        {getRankIcon(index)}
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={entry.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">{entry.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="flex-1 font-medium text-sm truncate">{entry.display_name}</span>
                        <Badge variant="secondary" className="font-bold">
                          {entry.total_score} {t('dailyChallenge.points')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </CardContent>
      </Tabs>
    </Card>
  );
}
