import { useState, useCallback, useMemo } from 'react';
import { useChronicle } from '@/hooks/useChronicle';
import { useSound } from '@/hooks/useSound';
import { TypewriterText } from './TypewriterText';
import { CharacterStats } from './CharacterStats';
import { QuestLog } from './QuestLog';
import { AchievementToast } from './AchievementToast';
import { getSampleAnswers } from './sampleData';

export function ChronicleEngine() {
  const {
    state,
    currentChapterDef,
    currentQuestionDef,
    answeredCount,
    totalQuestions,
    totalXp,
    chapters,
    isComplete,
    newAchievements,
    submitAnswer,
    skipQuestion,
    rewind,
    editAnswer,
    deleteAnswer,
    loadSampleData,
    resetProgress,
    dismissAchievement,
  } = useChronicle();

  const {
    isMuted,
    toggleMute,
    playBleep,
    playSuccess,
    playChapterFanfare,
    playLevelUp,
  } = useSound();

  const [inputValue, setInputValue] = useState('');
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    playSuccess();

    // Check if we're completing a chapter (last question)
    if (
      currentChapterDef &&
      state.currentQuestion === currentChapterDef.questions.length - 1
    ) {
      setTimeout(() => playChapterFanfare(), 300);
    }

    submitAnswer(inputValue.trim());
    setInputValue('');
    setTypewriterDone(false);
  }, [
    inputValue,
    submitAnswer,
    playSuccess,
    playChapterFanfare,
    currentChapterDef,
    state.currentQuestion,
  ]);

  const handleSkip = useCallback(() => {
    playBleep();
    skipQuestion();
    setInputValue('');
    setTypewriterDone(false);
  }, [skipQuestion, playBleep]);

  const handleRewind = useCallback(
    (chapterIndex: number, questionIndex: number) => {
      playBleep();
      rewind(chapterIndex, questionIndex);
      setShowQuestLog(false);
      setInputValue('');
      setTypewriterDone(false);
    },
    [rewind, playBleep],
  );

  const handleLoadSample = useCallback(() => {
    playLevelUp();
    loadSampleData(getSampleAnswers());
  }, [loadSampleData, playLevelUp]);

  const handleReset = useCallback(() => {
    resetProgress();
    setShowResetConfirm(false);
    setInputValue('');
    setTypewriterDone(false);
  }, [resetProgress]);

  const chapterProgress = useMemo(() => {
    if (!currentChapterDef) return '';
    return `Chapter ${state.currentChapter + 1} of ${chapters.length}`;
  }, [currentChapterDef, state.currentChapter, chapters.length]);

  // Completion screen
  if (isComplete) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="text-center py-12">
          <p className="font-rpg text-sm text-accent mb-4">
            QUEST COMPLETE
          </p>
          <h2 className="font-display text-3xl font-bold text-text-primary mb-4">
            Legend Status Achieved
          </h2>
          <p className="text-text-secondary leading-relaxed mb-8">
            You&rsquo;ve answered every question across all chapters.
            Your chronicle is complete &mdash; a full record of your life story,
            ready to be exported as a memoir.
          </p>
          <CharacterStats
            xp={state.xp}
            totalXp={totalXp}
            answeredCount={answeredCount}
            totalQuestions={totalQuestions}
            achievementCount={state.achievements.length}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-8">
      {/* Achievement toasts */}
      {newAchievements[0] && (
        <AchievementToast
          title={newAchievements[0].title}
          description={newAchievements[0].description}
          icon={newAchievements[0].icon}
          onDismiss={dismissAchievement}
        />
      )}

      {/* Quest Log modal */}
      {showQuestLog && (
        <QuestLog
          chapters={chapters}
          answers={state.answers}
          currentChapter={state.currentChapter}
          currentQuestion={state.currentQuestion}
          onRewind={handleRewind}
          onEditAnswer={editAnswer}
          onDeleteAnswer={deleteAnswer}
          onClose={() => setShowQuestLog(false)}
        />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-rpg text-[0.6rem] text-text-secondary">
          {chapterProgress}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-lg p-1"
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={() => setShowStats((s) => !s)}
            className="text-xs text-text-secondary hover:text-accent px-2 py-1 rounded border border-[var(--color-border)] transition-colors"
          >
            Stats
          </button>
          <button
            onClick={() => setShowQuestLog(true)}
            className="text-xs text-text-secondary hover:text-accent px-2 py-1 rounded border border-[var(--color-border)] transition-colors"
          >
            Quest Log
          </button>
        </div>
      </div>

      {/* Character Stats (collapsible) */}
      {showStats && (
        <div className="mb-4">
          <CharacterStats
            xp={state.xp}
            totalXp={totalXp}
            answeredCount={answeredCount}
            totalQuestions={totalQuestions}
            achievementCount={state.achievements.length}
          />
        </div>
      )}

      {/* Chapter title */}
      {currentChapterDef && (
        <div className="mb-6">
          <h2 className="font-rpg text-xs text-accent mb-1">
            {currentChapterDef.subtitle.toUpperCase()}
          </h2>
          <h3 className="font-display text-2xl font-bold text-text-primary">
            {currentChapterDef.title}
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            {currentChapterDef.description}
          </p>
        </div>
      )}

      {/* RPG dialogue box */}
      {currentQuestionDef && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-surface-card-border)] rounded-xl p-5 mb-4">
          {/* Quest type badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-[0.6rem] font-rpg px-2 py-0.5 rounded ${
                currentQuestionDef.required
                  ? 'bg-accent/15 text-accent'
                  : 'bg-text-secondary/10 text-text-secondary'
              }`}
            >
              {currentQuestionDef.required ? 'MAIN QUEST' : 'SIDE QUEST'}
            </span>
            <span className="text-[0.65rem] text-accent font-medium">
              +{currentQuestionDef.xp} XP
            </span>
          </div>

          {/* Typewriter prompt */}
          <TypewriterText
            text={currentQuestionDef.prompt}
            speed={25}
            onComplete={() => setTypewriterDone(true)}
            key={`${state.currentChapter}_${state.currentQuestion}`}
          />

          {/* Input area */}
          {typewriterDone && (
            <div className="mt-4 space-y-3">
              {currentQuestionDef.type === 'textarea' ? (
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentQuestionDef.placeholder}
                  rows={4}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 font-serif text-base focus:outline-none focus:border-accent transition-colors resize-none"
                />
              ) : currentQuestionDef.type === 'select' &&
                currentQuestionDef.options ? (
                <select
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg px-4 py-3 text-text-primary font-serif text-base focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">Choose your answer...</option>
                  {currentQuestionDef.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={currentQuestionDef.type === 'date' ? 'date' : 'text'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentQuestionDef.placeholder}
                  className="w-full bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg px-4 py-3 text-text-primary placeholder:text-text-secondary/50 font-serif text-base focus:outline-none focus:border-accent transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                />
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim()}
                  className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-[#1a1510] font-semibold py-3 rounded-lg transition-colors"
                >
                  Submit Answer
                </button>
                {!currentQuestionDef.required && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-3 text-text-secondary hover:text-text-primary border border-[var(--color-border)] rounded-lg transition-colors text-sm"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress indicator */}
      {currentChapterDef && (
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{
                width: `${
                  ((state.currentQuestion + 1) /
                    currentChapterDef.questions.length) *
                  100
                }%`,
              }}
            />
          </div>
          <span className="text-xs text-text-secondary whitespace-nowrap">
            {state.currentQuestion + 1}/{currentChapterDef.questions.length}
          </span>
        </div>
      )}

      {/* Sample data & reset */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
        <button
          onClick={handleLoadSample}
          className="text-xs text-text-secondary hover:text-accent transition-colors"
        >
          Load sample data
        </button>
        {answeredCount > 0 && (
          <>
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">
                  Reset all progress?
                </span>
                <button
                  onClick={handleReset}
                  className="text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Yes, reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="text-xs text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-text-secondary hover:text-red-400 transition-colors"
              >
                Reset progress
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
