import { useState, useMemo, useCallback, memo } from 'react';
import type { ChapterDefinition, ChronicleAnswer } from '@/types/chronicle.types';

type QuestStatus = 'completed' | 'skipped' | 'undiscovered' | 'current';

interface QuestItemData {
  chapterIndex: number;
  chapterTitle: string;
  chapterId: string;
  questionId: string;
  prompt: string;
  required: boolean;
  xp: number;
  status: QuestStatus;
  answerValue: string;
  answerKey: string;
}

interface QuestLogProps {
  chapters: ChapterDefinition[];
  answers: Record<string, ChronicleAnswer>;
  currentChapter: number;
  currentQuestion: number;
  onRewind: (chapterIndex: number, questionIndex: number) => void;
  onEditAnswer?: (key: string, newValue: string) => void;
  onDeleteAnswer?: (key: string) => void;
  onClose: () => void;
}

export const QuestLog = memo(function QuestLog({
  chapters,
  answers,
  currentChapter,
  currentQuestion,
  onRewind,
  onEditAnswer,
  onDeleteAnswer,
  onClose,
}: QuestLogProps) {
  const quests = useMemo(() => {
    const items: QuestItemData[] = [];
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
          chapterId: chapter.id,
          questionId: q.id,
          prompt: q.prompt,
          required: q.required,
          xp: q.xp,
          status,
          answerValue: answers[key]?.value ?? '',
          answerKey: key,
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
    const groups = new Map<string, QuestItemData[]>();
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
                  <QuestItemRow
                    key={`${q.chapterIndex}_${q.questionId}`}
                    quest={q}
                    chapters={chapters}
                    onRewind={onRewind}
                    onEditAnswer={onEditAnswer}
                    onDeleteAnswer={onDeleteAnswer}
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

const QuestItemRow = memo(function QuestItemRow({
  quest,
  chapters,
  onRewind,
  onEditAnswer,
  onDeleteAnswer,
}: {
  quest: QuestItemData;
  chapters: ChapterDefinition[];
  onRewind: (chapterIndex: number, questionIndex: number) => void;
  onEditAnswer?: (key: string, newValue: string) => void;
  onDeleteAnswer?: (key: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(quest.answerValue);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRewind = useCallback(() => {
    const chapter = chapters[quest.chapterIndex];
    if (!chapter) return;
    const qIdx = chapter.questions.findIndex((q) => q.id === quest.questionId);
    if (qIdx >= 0) {
      onRewind(quest.chapterIndex, qIdx);
    }
  }, [quest, chapters, onRewind]);

  const handleSaveEdit = useCallback(() => {
    if (editValue.trim() && onEditAnswer) {
      onEditAnswer(quest.answerKey, editValue.trim());
    }
    setEditing(false);
  }, [editValue, onEditAnswer, quest.answerKey]);

  const handleDelete = useCallback(() => {
    if (onDeleteAnswer) {
      onDeleteAnswer(quest.answerKey);
    }
    setConfirmDelete(false);
  }, [onDeleteAnswer, quest.answerKey]);

  const statusIcon =
    quest.status === 'completed'
      ? '✅'
      : quest.status === 'skipped'
        ? '⏭️'
        : quest.status === 'current'
          ? '▶️'
          : '❓';

  const canRewind = quest.status === 'skipped' || quest.status === 'undiscovered';
  const isCompleted = quest.status === 'completed';

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${
        quest.status === 'completed'
          ? 'bg-green-500/5 border-green-500/20'
          : quest.status === 'current'
            ? 'bg-accent/5 border-accent/30'
            : 'bg-transparent border-[var(--color-border)]'
      }`}
    >
      <div className="flex items-start gap-3">
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
          {isCompleted && !editing && (
            <p className="text-xs text-text-secondary mt-1 font-body italic line-clamp-2">
              {quest.answerValue}
            </p>
          )}
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
        <div className="flex items-center gap-1 shrink-0">
          {canRewind && (
            <button
              onClick={handleRewind}
              className="text-xs text-accent hover:text-accent-hover font-medium px-2 py-1 rounded border border-accent/30 hover:border-accent/60 transition-colors"
            >
              Rewind
            </button>
          )}
          {isCompleted && onEditAnswer && (
            <button
              onClick={() => { setEditing(true); setEditValue(quest.answerValue); }}
              className="text-xs text-text-secondary hover:text-accent px-1.5 py-1 transition-colors"
              title="Edit answer"
            >
              ✎
            </button>
          )}
          {isCompleted && onDeleteAnswer && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-text-secondary hover:text-red-400 px-1.5 py-1 transition-colors"
              title="Delete answer"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Inline edit */}
      {editing && (
        <div className="ml-9 space-y-2">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={3}
            className="w-full bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg px-3 py-2 text-text-primary font-body text-sm focus:outline-none focus:border-accent resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={!editValue.trim()}
              className="px-3 py-1 rounded-lg bg-[var(--color-accent)] text-white text-xs font-body hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-40"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1 rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="ml-9 flex items-center gap-2">
          <span className="text-xs text-text-secondary font-body">Remove this answer?</span>
          <button
            onClick={handleDelete}
            className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-2 py-1 rounded text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
});
