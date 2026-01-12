import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MessageSquarePlus, 
  History, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Check, 
  X,
  MessageCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Conversation } from '@/hooks/useSahbiConversations';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface SahbiSidebarProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelect: (conversation: Conversation) => void;
  onCreate: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function SahbiSidebar({
  conversations,
  currentConversation,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  isLoading
}: SahbiSidebarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  const handleStartEdit = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleConfirmDelete = () => {
    if (deleteDialogId) {
      onDelete(deleteDialogId);
      setDeleteDialogId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground relative"
            title={t('sahbi.history') || 'Chat History'}
          >
            <History className="h-5 w-5" />
            {conversations.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {conversations.length > 99 ? '99+' : conversations.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 flex flex-col">
          <SheetHeader className="p-4 border-b bg-gradient-to-r from-primary/5 to-amber-500/5">
            <SheetTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              {t('sahbi.conversations') || 'Conversations'}
            </SheetTitle>
          </SheetHeader>

          <div className="p-3 border-b">
            <Button
              onClick={() => {
                onCreate();
                setIsOpen(false);
              }}
              className="w-full bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
            >
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              {t('sahbi.newConversation') || 'New Conversation'}
            </Button>
          </div>

          {!user && (
            <div className="px-3 py-2 bg-amber-500/10 border-b">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t('sahbi.guestMode') || 'Guest mode: conversations saved locally'}
              </p>
            </div>
          )}

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-xl" />
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{t('sahbi.noConversations') || 'No conversations yet'}</p>
                <p className="text-xs mt-1">{t('sahbi.startNew') || 'Start a new chat to begin'}</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      "group relative rounded-xl transition-all duration-200",
                      currentConversation?.id === conv.id
                        ? "bg-primary/10 border-2 border-primary/30"
                        : "hover:bg-muted/50 border-2 border-transparent"
                    )}
                  >
                    {editingId === conv.id ? (
                      <div className="p-3 flex items-center gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveEdit}>
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          onSelect(conv);
                          setIsOpen(false);
                        }}
                        className="w-full text-left p-3 pr-10"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                            currentConversation?.id === conv.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}>
                            <MessageCircle className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{conv.title}</h4>
                            {conv.last_message_preview && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {conv.last_message_preview}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(conv.updated_at)}</span>
                              <span className="text-primary">•</span>
                              <span>{conv.message_count} {t('sahbi.messages') || 'messages'}</span>
                            </div>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
                            currentConversation?.id === conv.id && "text-primary opacity-100"
                          )} />
                        </div>
                      </button>
                    )}

                    {editingId !== conv.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStartEdit(conv)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            {t('common.rename') || 'Rename'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteDialogId(conv.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.delete') || 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteDialogId} onOpenChange={() => setDeleteDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sahbi.deleteConversation') || 'Delete Conversation?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('sahbi.deleteWarning') || 'This will permanently delete this conversation and all its messages. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('common.delete') || 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
