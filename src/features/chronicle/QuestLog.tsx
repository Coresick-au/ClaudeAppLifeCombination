import { useMemo, useCallback, memo } from 'react';
import type { ChapterDefinition, ChronicleAnswer } from '@/types/chronicle.types';

type QuestStatus = 'completed' | 'skipped' | 'undiscovered' | 'current';

interface QuestItem {
  chapterIndex: number;
  chapterTitle: string;
  questionId: string;
  prompt: string;
  required: boolean;
  xp: number;
  status: QuestStatus;
}

interface QuestLogProps {
  chapters: ChapterDefinition[];
  answers: Record<string, ChronicleAnswer>;
  currentChapter: number;
  currentQuestion: number;
  onRewind: (chapterIndex: number, questionIndex: number) => void;
  onClose: () => void;
}

export const QuestLog = memo(function QuestLog({
  chapters,
  answers,
  currentChapter,
  currentQuestion,
  onRewind,
  onClose,
}: QuestLogProps) {
  const quests = useMemo(() => {
    const items: QuestItem[] = [];
    chapters.forEach((chapter, chIdx) => {
      chapter.questions.forEach((q, _qIdx) => {
        const key = `${chapter.id}_${q.id}`;
        const isCurrent =
          chIdx === currentChapter &&
          _qIdx === currentQuestion;

        let status: QuestStatus;
        if (key in answers) {
          status = 'completed';
        } else if (isCurrent) {
          status = 'current';
        } else if (
          chIdx < currentChapter ||
          (chIdx === currentChapter && _qIdx < currentQuestion)
        ) {
          status = 'skipped';
        } else {
          status = 'undiscovered';
        }

        items.push({
          chapterIndex: chIdx,
          chapterTitle: chapter.title,
          questionId: q.id,
          prompt: q.prompt,
          required: q.required,
          xp: q.xp,
          status,
        });
      });
    });
    return items;
  }, [chapters, answers, currentChapter, currentQuestion]);

  const counts = useMemo(() => {
    const c = { completed: 0, skipped: 0, undiscovered: 0, current: 0 };
    for (const q of quests) {
      c[q.status] += 1;
    }
    return c;
  }, [quests]);

  // Group by chapter
  const grouped = useMemo(() => {
    const groups = new Map<string, QuestItem[]>();
    for (const q of quests) {
      const existing = groups.get(q.chapterTitle) ?? [];
      existing.push(q);
      groups.set(q.chapterTitle, existing);
    }
    return groups;
  }, [quests]);

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-[var(--color-surface)] w-full max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="font-rpg text-sm text-accent">QUEST LOG</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Summary badges */}
        <div className="flex gap-3 px-4 py-3 border-b border-[var(--color-border)]">
          <Badge label="Done" count={counts.completed} colour="text-green-400" />
          <Badge label="Skipped" count={counts.skipped} colour="text-amber-400" />
          <Badge label="Unseen" count={counts.undiscovered} colour="text-text-secondary" />
        </div>

        {/* Quest list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-6">
          {Array.from(grouped.entries()).map(([chapterTitle, items]) => (
            <div key={chapterTitle}>
              <h3 className="font-display font-bold text-sm text-text-secondary uppercase tracking-wider mb-2">
                {chapterTitle}
              </h3>
              <div className="space-y-2">
                {items.map((q) => (
                  <QuestItem
                    key={`${q.chapterIndex}_${q.questionId}`}
                    quest={q}
                    chapters={chapters}
                    onRewind={onRewind}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const Badge = memo(function Badge({
  label,
  count,
  colour,
}: {
  label: string;
  count: number;
  colour: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`font-bold ${colour}`}>{count}</span>
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  );
});

const QuestItem = memo(function QuestItem({
  quest,
  chapters,
  onRewind,
}: {
  quest: QuestItem;
  chapters: ChapterDefinition[];
  onRewind: (chapterIndex: number, questionIndex: number) => void;
}) {
  const handleRewind = useCallback(() => {
    const chapter = chapters[quest.chapterIndex];
    if (!chapter) return;
    const qIdx = chapter.questions.findIndex((q) => q.id === quest.questionId);
    if (qIdx >= 0) {
      onRewind(quest.chapterIndex, qIdx);
    }
  }, [quest, chapters, onRewind]);

  const statusIcon =
    quest.status === 'completed'
      ? '✅'
      : quest.status === 'skipped'
        ? '⏭️'
        : quest.status === 'current'
          ? '▶️'
          : '❓';

  const canRewind = quest.status === 'skipped' || quest.status === 'undiscovered';

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        quest.status === 'completed'
          ? 'bg-green-500/5 border-green-500/20'
          : quest.status === 'current'
            ? 'bg-accent/5 border-accent/30'
            : 'bg-transparent border-[var(--color-border)]'
      }`}
    >
      <span className="text-lg mt-0.5">{statusIcon}</span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            quest.status === 'undiscovered'
              ? 'text-text-secondary italic'
              : 'text-text-primary'
          }`}
        >
          {quest.status === 'undiscovered'
            ? 'Undiscovered quest...'
            : quest.prompt}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[0.65rem] text-accent font-medium">
            {quest.xp} XP
          </span>
          <span
            className={`text-[0.6rem] px-1.5 py-0.5 rounded font-medium ${
              quest.required
                ? 'bg-accent/10 text-accent'
                : 'bg-text-secondary/10 text-text-secondary'
            }`}
          >
            {quest.required ? 'MAIN' : 'SIDE'}
          </span>
        </div>
      </div>
      {canRewind && (
        <button
          onClick={handleRewind}
          className="text-xs text-accent hover:text-accent-hover font-medium px-2 py-1 rounded border border-accent/30 hover:border-accent/60 transition-colors shrink-0"
        >
          Rewind
        </button>
      )}
    </div>
  );
});
