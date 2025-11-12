import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLevelInfo } from "@shared/gamification";
import { Sparkles, TrendingUp } from "lucide-react";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
}

export function LevelUpModal({ isOpen, onClose, oldLevel, newLevel }: LevelUpModalProps) {
  const oldLevelInfo = getLevelInfo(oldLevel);
  const newLevelInfo = getLevelInfo(newLevel);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-level-up">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="w-12 h-12 text-primary" data-testid="icon-sparkles" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl" data-testid="text-modal-title">
            Level Up!
          </DialogTitle>
          <DialogDescription className="text-center" data-testid="text-modal-description">
            Congratulations on reaching a new milestone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center" data-testid="container-old-level">
              <div className="text-4xl mb-2">{oldLevelInfo.symbol}</div>
              <Badge variant="secondary" data-testid="badge-old-level">
                Level {oldLevel}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1" data-testid="text-old-level-label">
                {oldLevelInfo.label}
              </p>
            </div>

            <TrendingUp className="w-6 h-6 text-primary" data-testid="icon-trending-up" />

            <div className="text-center" data-testid="container-new-level">
              <div className="text-5xl mb-2 animate-in zoom-in duration-500">
                {newLevelInfo.symbol}
              </div>
              <Badge variant="default" data-testid="badge-new-level">
                Level {newLevel}
              </Badge>
              <p className="text-sm font-medium mt-1" data-testid="text-new-level-label">
                {newLevelInfo.label}
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm italic text-muted-foreground" data-testid="text-tagline">
              "{newLevelInfo.tagline}"
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full" data-testid="button-continue">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
