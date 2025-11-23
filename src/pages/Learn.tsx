import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Trophy, Flame, BookOpen, Lock, Star, ChevronLeft, LogOut } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { LessonModal } from "@/components/LessonModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileSection } from "@/components/ProfileSection";

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: number;
  order_index: number;
  category: string;
  xp_reward: number;
}

interface UserProgress {
  lesson_id: string;
  completed: boolean;
  score: number;
}

interface Profile {
  total_xp: number;
  current_streak: number;
  display_name: string;
  avatar_url?: string;
}

const Learn = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      await Promise.all([
        fetchProfile(session.user.id),
        fetchLessons(),
        fetchUserProgress(session.user.id)
      ]);
    } catch (error) {
      console.error('Error checking user:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Error fetching lessons:', error);
      return;
    }

    setLessons(data || []);
  };

  const fetchUserProgress = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('lesson_id, completed, score')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching progress:', error);
      return;
    }

    setUserProgress(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isLessonUnlocked = (lesson: Lesson) => {
    if (lesson.order_index === 1) return true;
    
    const previousLesson = lessons.find(l => l.order_index === lesson.order_index - 1);
    if (!previousLesson) return false;
    
    const previousProgress = userProgress.find(p => p.lesson_id === previousLesson.id);
    return previousProgress?.completed || false;
  };

  const getLessonProgress = (lessonId: string) => {
    const progress = userProgress.find(p => p.lesson_id === lessonId);
    return progress || { completed: false, score: 0 };
  };

  const handleLessonComplete = () => {
    // Refresh data after lesson completion
    if (user) {
      fetchProfile(user.id);
      fetchUserProgress(user.id);
    }
    setSelectedLesson(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Learn Darija | Tarjama</title>
        <meta name="description" content="Master Moroccan Darija with interactive lessons and exercises" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Translator
            </Button>

            <div className="flex items-center gap-4">
              {/* User Stats */}
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-sm">{profile?.current_streak || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-sm">{profile?.total_xp || 0} XP</span>
                </div>
              </div>

              <ThemeToggle />

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container max-w-4xl mx-auto px-4 py-8">
          {/* Profile Section */}
          <div className="mb-8">
            <ProfileSection
              displayName={profile?.display_name}
              avatarUrl={profile?.avatar_url}
              email={user?.email}
              totalXp={profile?.total_xp}
              currentStreak={profile?.current_streak}
              onSignOut={handleSignOut}
            />
          </div>

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Continue your Darija learning journey 🎯
            </h1>
            <p className="text-muted-foreground">
              Keep up the great work!
            </p>
          </div>

          {/* Mobile Stats */}
          <div className="flex sm:hidden items-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-sm">{profile?.current_streak || 0} day streak</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-bold text-sm">{profile?.total_xp || 0} XP</span>
            </div>
          </div>

          {/* Lessons Grid */}
          <div className="space-y-4">
            {lessons.map((lesson) => {
              const progress = getLessonProgress(lesson.id);
              const unlocked = isLessonUnlocked(lesson);

              return (
                <Card
                  key={lesson.id}
                  className={`p-6 transition-all duration-300 ${
                    unlocked
                      ? 'cursor-pointer hover:shadow-moroccan hover:scale-[1.02] bg-card/80 backdrop-blur-sm border-border/50'
                      : 'opacity-60 bg-muted/50'
                  }`}
                  onClick={() => unlocked && setSelectedLesson(lesson)}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      progress.completed
                        ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500'
                        : unlocked
                        ? 'bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/50'
                        : 'bg-muted border-2 border-border'
                    }`}>
                      {!unlocked ? (
                        <Lock className="w-8 h-8 text-muted-foreground" />
                      ) : progress.completed ? (
                        <Star className="w-8 h-8 text-green-500 fill-green-500" />
                      ) : (
                        <BookOpen className="w-8 h-8 text-primary" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{lesson.title}</h3>
                        {progress.completed && (
                          <div className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 text-xs font-semibold">
                            Completed
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{lesson.description}</p>
                      
                      {progress.completed && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Best Score: {progress.score}%</span>
                            <span>{lesson.xp_reward} XP</span>
                          </div>
                        </div>
                      )}
                      
                      {!progress.completed && unlocked && (
                        <div className="text-xs text-muted-foreground">
                          Earn {lesson.xp_reward} XP
                        </div>
                      )}
                    </div>

                    {/* Level Badge */}
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-lg bg-accent/10 border border-accent/20">
                        <span className="text-xs font-bold">Level {lesson.level}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </main>
      </div>

      {/* Lesson Modal */}
      {selectedLesson && (
        <LessonModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onComplete={handleLessonComplete}
        />
      )}
    </>
  );
};

export default Learn;