import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { LogOut, Trophy, Flame } from "lucide-react";

interface ProfileSectionProps {
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  totalXp?: number;
  currentStreak?: number;
  onSignOut: () => void;
  compact?: boolean;
}

export const ProfileSection = ({
  displayName,
  avatarUrl,
  email,
  totalXp = 0,
  currentStreak = 0,
  onSignOut,
  compact = false,
}: ProfileSectionProps) => {
  const getInitials = () => {
    if (displayName) {
      return displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarImage src={avatarUrl} alt={displayName || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{displayName || email}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-500" />
              {totalXp} XP
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              {currentStreak} day streak
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onSignOut} title="Sign Out">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage src={avatarUrl} alt={displayName || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold truncate">{displayName || "Learner"}</h3>
          {email && <p className="text-sm text-muted-foreground truncate">{email}</p>}
          
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-bold text-sm">{totalXp} XP</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-sm">{currentStreak} day streak</span>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={onSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </Card>
  );
};
