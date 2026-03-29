import React, { useEffect, useMemo, useState } from 'react';
import { Mic } from 'lucide-react';
import { analyzePronunciation } from '@/services/pronunciationService';

type TokenRole = 'subject' | 'verb' | 'object' | 'time' | 'place' | 'adverb' | 'other';

export type WordToken = {
  id: string;
  text: string;
  role?: TokenRole;
};

export type V2ExerciseData = {
  id: string;
  instruction?: string;
  hint?: string;
  explanation?: string;
  tokens: WordToken[];
  correctOrder: string[];
};

export type V2CompletionResult = {
  exerciseId: string;
  isCorrect: boolean;
  userOrder: string[];
  targetOrder: string[];
};

type SlotStatus = 'empty' | 'idle' | 'correct' | 'incorrect' | 'highlight';

type Props = {
  exercise: V2ExerciseData;
  onComplete?: (result: V2CompletionResult) => void;
  beginnerMode?: boolean;
  lockSlot2ToVerb?: boolean;
  showGhostPattern?: boolean;
  showRoleHints?: boolean;
  canRevealAnswer?: boolean;
  labels?: {
    title?: string;
    slot1?: string;
    slot2?: string;
    rest?: string;
    check?: string;
    reset?: string;
    reveal?: string;
  };
};

type SlotValue = string | null;

function getTokenById(tokens: WordToken[], id: string | null) {
  if (!id) return null;
  return tokens.find((t) => t.id === id) ?? null;
}

function getRoleLabel(role?: TokenRole) {
  switch (role) {
    case 'verb':
      return 'Verb';
    case 'subject':
      return 'Subject';
    case 'time':
      return 'Time';
    case 'place':
      return 'Place';
    case 'object':
      return 'Object';
    case 'adverb':
      return 'Adverb';
    default:
      return 'Word';
  }
}

function buildSentence(tokens: WordToken[]) {
  return tokens.map((t) => t.text).join(' ');
}

function getOrderedIds(slot1: SlotValue, slot2: SlotValue, rest: string[]) {
  return [slot1, slot2, ...rest].filter(Boolean) as string[];
}

function getAvailableTokens(tokens: WordToken[], usedIds: Set<string>) {
  return tokens.filter((t) => !usedIds.has(t.id));
}

function getFeedback(params: {
  checked: boolean;
  isComplete: boolean;
  isCorrect: boolean;
  slot2Token: WordToken | null;
  coachMessage: string;
  explanation?: string;
}) {
  const { checked, isComplete, isCorrect, slot2Token, coachMessage, explanation } = params;

  if (!checked) return null;

  if (coachMessage) {
    return {
      title: 'Guided hint',
      body: coachMessage,
      extra: explanation,
    };
  }

  if (!isComplete) {
    return {
      title: 'Finish the sentence first',
      body: 'Place all tokens before checking your answer.',
      extra: explanation,
    };
  }

  if (isCorrect) {
    return {
      title: 'Correct!',
      body: 'Goed zo — the finite verb is in slot 2 and the sentence is correct.',
      extra: undefined,
    };
  }

  if (!slot2Token) {
    return {
      title: 'Focus on slot 2',
      body: 'In a Dutch main clause, slot 2 usually contains the finite verb.',
      extra: explanation,
    };
  }

  if (slot2Token.role !== 'verb') {
    return {
      title: 'Verb needed in slot 2',
      body: 'Move the finite verb into slot 2 first. Then adjust the rest of the sentence.',
      extra: explanation,
    };
  }

  return {
    title: 'Almost there',
    body: 'The verb is in the correct slot, but one or more other parts are still out of order.',
    extra: explanation,
  };
}

function TokenChip({
  token,
  selected,
  disabled,
  highlighted,
  showRoleHints,
  onClick,
}: {
  token: WordToken;
  selected?: boolean;
  disabled?: boolean;
  highlighted?: boolean;
  showRoleHints?: boolean;
  onClick?: () => void;
}) {
  const isVerb = token.role === 'verb';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        'rounded-2xl border px-4 py-3 text-left shadow-sm transition',
        selected ? 'ring-2 ring-zinc-500' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md',
        isVerb
          ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30'
          : 'bg-white dark:bg-zinc-900',
        highlighted ? 'ring-2 ring-blue-400' : '',
      ].join(' ')}
    >
      <div className="font-medium">{token.text}</div>
      {showRoleHints ? (
        <div className="mt-1 text-xs text-zinc-500">{getRoleLabel(token.role)}</div>
      ) : null}
      {isVerb ? (
        <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
          Verb
        </div>
      ) : null}
    </button>
  );
}

function SlotCard({
  label,
  description,
  token,
  status,
  showRoleHints,
  onPlace,
  onRemove,
}: {
  label: string;
  description?: string;
  token: WordToken | null;
  status: SlotStatus;
  showRoleHints?: boolean;
  onPlace?: () => void;
  onRemove?: () => void;
}) {
  const statusClasses =
    status === 'correct'
      ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30'
      : status === 'incorrect'
      ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30'
      : status === 'highlight'
      ? 'border-blue-400 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/20'
      : status === 'empty'
      ? 'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/40'
      : 'border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950';

  if (!token) {
    return (
      <button
        type="button"
        onClick={onPlace}
        className={`min-h-[92px] w-full rounded-2xl border-2 border-dashed px-4 py-3 text-left transition ${statusClasses}`}
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </div>
        <div className="mt-2 text-sm text-zinc-500">{description || 'Choose a token'}</div>
      </button>
    );
  }

  return (
    <div className={`flex items-center justify-between rounded-2xl border p-3 ${statusClasses}`}>
      <div>
        <div className="font-medium">{token.text}</div>
        {showRoleHints ? (
          <div className="mt-1 text-xs text-zinc-500">{getRoleLabel(token.role)}</div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-xl border px-3 py-1 text-sm"
      >
        Remove
      </button>
    </div>
  );
}

function RestItem({
  token,
  index,
  lastIndex,
  showRoleHints,
  status,
  onLeft,
  onRight,
  onRemove,
}: {
  token: WordToken;
  index: number;
  lastIndex: number;
  showRoleHints?: boolean;
  status: SlotStatus;
  onLeft: () => void;
  onRight: () => void;
  onRemove: () => void;
}) {
  const statusClasses =
    status === 'correct'
      ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30'
      : status === 'incorrect'
      ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30'
      : 'border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950';

  return (
    <div className={`flex items-center justify-between rounded-2xl border p-3 ${statusClasses}`}>
      <div>
        <div className="font-medium">{token.text}</div>
        {showRoleHints ? (
          <div className="mt-1 text-xs text-zinc-500">{getRoleLabel(token.role)}</div>
        ) : null}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onLeft}
          disabled={index === 0}
          className="rounded-xl border px-3 py-1 text-sm disabled:opacity-50"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onRight}
          disabled={index === lastIndex}
          className="rounded-xl border px-3 py-1 text-sm disabled:opacity-50"
        >
          →
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl border px-3 py-1 text-sm"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default function V2GuidedSlotExercisePro({
  exercise,
  onComplete,
  beginnerMode = true,
  lockSlot2ToVerb = true,
  showGhostPattern = true,
  showRoleHints = true,
  canRevealAnswer = true,
  labels,
}: Props) {
  const mergedLabels = {
    title: labels?.title ?? 'V2 Guided Sentence Builder',
    slot1: labels?.slot1 ?? 'Slot 1',
    slot2: labels?.slot2 ?? 'Slot 2 — Finite Verb',
    rest: labels?.rest ?? 'Rest of the sentence',
    check: labels?.check ?? 'Check answer',
    reset: labels?.reset ?? 'Reset',
    reveal: labels?.reveal ?? 'Show answer',
  };

  const initialTokens = useMemo(() => exercise.tokens, [exercise.tokens]);

  const [slot1, setSlot1] = useState<SlotValue>(null);
  const [slot2, setSlot2] = useState<SlotValue>(null);
  const [rest, setRest] = useState<string[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [coachMessage, setCoachMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'nl-NL';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setRecognizedText(text);
      const feedback = await analyzePronunciation(text, sentencePreview);
      setRecognizedText(feedback);
    };

    recognition.start();
  };

  useEffect(() => {
    setSlot1(null);
    setSlot2(null);
    setRest([]);
    setSelectedTokenId(null);
    setChecked(false);
    setShowAnswer(false);
    setCoachMessage('');
    setRecognizedText('');
  }, [exercise.id, initialTokens]);

  const usedIds = new Set([slot1, slot2, ...rest].filter(Boolean) as string[]);
  const availableTokens = getAvailableTokens(initialTokens, usedIds);

  const orderedIds = getOrderedIds(slot1, slot2, rest);
  const orderedTokens = orderedIds
    .map((id) => getTokenById(initialTokens, id))
    .filter(Boolean) as WordToken[];

  const sentencePreview = buildSentence(orderedTokens);
  const selectedToken = getTokenById(initialTokens, selectedTokenId);
  const slot1Token = getTokenById(initialTokens, slot1);
  const slot2Token = getTokenById(initialTokens, slot2);

  const correctOrder = exercise.correctOrder;
  const correctSlot1 = correctOrder[0] ?? null;
  const correctSlot2 = correctOrder[1] ?? null;
  const correctRest = correctOrder.slice(2);

  const isComplete = orderedIds.length === (initialTokens?.length || 0);
  const isCorrect =
    orderedIds.length === (correctOrder?.length || 0) &&
    orderedIds.every((id, i) => id === correctOrder[i]);

  const shouldGuideToVerb =
    beginnerMode && !slot2 && availableTokens.some((t) => t.role === 'verb');

  function chooseToken(id: string) {
    setSelectedTokenId((prev) => (prev === id ? null : id));
    setChecked(false);
    setShowAnswer(false);
    setCoachMessage('');
  }

  function placeSelectedInSlot(which: 'slot1' | 'slot2') {
    if (!selectedTokenId) return;

    const token = getTokenById(initialTokens, selectedTokenId);
    if (!token) return;

    if (which === 'slot1') {
      if (slot1) return;
      setSlot1(selectedTokenId);
    } else {
      if (slot2) return;
      if (lockSlot2ToVerb && token.role !== 'verb') {
        setCoachMessage(
          'In beginner mode, slot 2 is reserved for the finite verb. Choose the verb first.'
        );
        setChecked(true);
        return;
      }
      setSlot2(selectedTokenId);
    }

    setSelectedTokenId(null);
    setChecked(false);
    setShowAnswer(false);
    setCoachMessage('');
  }

  function addSelectedToRest() {
    if (!selectedTokenId) return;
    setRest((prev) => [...prev, selectedTokenId]);
    setSelectedTokenId(null);
    setChecked(false);
    setShowAnswer(false);
    setCoachMessage('');
  }

  function removeFromSlot(which: 'slot1' | 'slot2') {
    if (which === 'slot1') setSlot1(null);
    else setSlot2(null);
    setChecked(false);
    setShowAnswer(false);
    setCoachMessage('');
  }

  function moveRest(index: number, direction: 'left' | 'right') {
    setRest((prev) => {
      const next = [...prev];
      const swapIndex = direction === 'left' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= next.length) return prev;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
    setChecked(false);
    setShowAnswer(false);
    setCoachMessage('');
  }

  function removeRest(index: number) {
    setRest((prev) => prev.filter((_, i) => i !== index));
    setChecked(false);
    setShowAnswer(false);
    setCoachMessage('');
  }

  function resetAll() {
    setSlot1(null);
    setSlot2(null);
    setRest([]);
    setSelectedTokenId(null);
    setChecked(false);
    setShowAnswer(false);
    setCoachMessage('');
  }

  function revealAnswer() {
    setSlot1(correctSlot1);
    setSlot2(correctSlot2);
    setRest(correctRest);
    setSelectedTokenId(null);
    setChecked(true);
    setShowAnswer(true);
    setCoachMessage('');
  }

  function checkAnswer() {
    if (beginnerMode && !slot2) {
      setChecked(true);
      setCoachMessage(
        'Place the finite verb in slot 2 first. Dutch main clauses usually require that.'
      );
      return;
    }

    if (!isComplete) {
      setChecked(true);
      setCoachMessage('Finish placing all tokens before checking your answer.');
      return;
    }

    setChecked(true);
    setCoachMessage('');
    onComplete?.({
      exerciseId: exercise.id,
      isCorrect,
      userOrder: orderedIds,
      targetOrder: correctOrder,
    });
  }

  function slot1Status(): SlotStatus {
    if (!slot1Token) return 'empty';
    if (!checked) return 'idle';
    return slot1 === correctSlot1 ? 'correct' : 'incorrect';
  }

  function slot2Status(): SlotStatus {
    if (!slot2Token) return shouldGuideToVerb ? 'highlight' : 'empty';
    if (!checked) {
      return slot2Token.role === 'verb' ? 'highlight' : 'idle';
    }
    return slot2 === correctSlot2 ? 'correct' : 'incorrect';
  }

  function restItemStatus(index: number, tokenId: string): SlotStatus {
    if (!checked) return 'idle';
    const targetId = correctRest[index];
    return tokenId === targetId ? 'correct' : 'incorrect';
  }

  const feedback = getFeedback({
    checked,
    isComplete,
    isCorrect,
    slot2Token,
    coachMessage,
    explanation: exercise.explanation,
  });

  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm dark:bg-zinc-950">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{mergedLabels.title}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {exercise.instruction || 'Build the Dutch sentence. Put the finite verb in slot 2.'}
          </p>
          {exercise.hint ? (
            <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              {exercise.hint}
            </p>
          ) : null}
        </div>

        {beginnerMode ? (
          <div className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
            Beginner mode
          </div>
        ) : null}
      </div>

      {showGhostPattern ? (
        <div className="mb-4 rounded-2xl border border-dashed p-3 text-sm text-zinc-600 dark:text-zinc-400">
          Pattern: <span className="font-medium">[Slot 1]</span> +{' '}
          <span className="font-medium text-blue-700 dark:text-blue-300">[Verb in Slot 2]</span> +{' '}
          <span className="font-medium">[Rest]</span>
        </div>
      ) : null}

      <div className="mb-5 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Sentence preview
          </div>
          <button
            type="button"
            className={`p-2 rounded-full ${isListening ? 'bg-red-100 text-red-600' : 'bg-zinc-200 text-zinc-600'}`}
            onClick={startListening}
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
        <p className="text-lg font-medium">{sentencePreview || '—'}</p>
        {recognizedText && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{recognizedText}</p>
        )}
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border p-4">
          <div className="mb-3 text-sm font-semibold">Token bank</div>
          <div className="flex flex-wrap gap-3">
            {availableTokens.length === 0 ? (
              <p className="text-sm text-zinc-500">All tokens have been placed.</p>
            ) : (
              availableTokens.map((token) => (
                <TokenChip
                  key={token.id}
                  token={token}
                  selected={selectedTokenId === token.id}
                  highlighted={shouldGuideToVerb && token.role === 'verb'}
                  showRoleHints={showRoleHints}
                  onClick={() => chooseToken(token.id)}
                />
              ))
            )}
          </div>

          {beginnerMode ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Teaching tip: for Dutch main clauses, start by finding the verb and placing it in slot 2.
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border p-4">
          <div className="mb-3 text-sm font-semibold">Selected token</div>
          {selectedToken ? (
            <div className="rounded-2xl border p-3">
              <div className="font-medium">{selectedToken.text}</div>
              {showRoleHints ? (
                <div className="mt-1 text-sm text-zinc-500">
                  {getRoleLabel(selectedToken.role)}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => placeSelectedInSlot('slot1')}
                  disabled={!!slot1}
                  className="rounded-2xl border px-4 py-2 text-sm shadow-sm disabled:opacity-50"
                >
                  Place in slot 1
                </button>
                <button
                  type="button"
                  onClick={() => placeSelectedInSlot('slot2')}
                  disabled={!!slot2}
                  className="rounded-2xl border px-4 py-2 text-sm shadow-sm disabled:opacity-50"
                >
                  Place in slot 2
                </button>
                <button
                  type="button"
                  onClick={addSelectedToRest}
                  className="rounded-2xl border px-4 py-2 text-sm shadow-sm"
                >
                  Add to rest
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTokenId(null)}
                  className="rounded-2xl border px-4 py-2 text-sm shadow-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Select a token from the bank.</p>
          )}
        </div>
      </div>

      <div className="mb-5 rounded-2xl border p-4">
        <div className="mb-4 text-sm font-semibold">Sentence frame</div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {mergedLabels.slot1}
            </div>
            <SlotCard
              label={mergedLabels.slot1}
              description="Topic, subject, time, or place"
              token={slot1Token}
              status={slot1Status()}
              showRoleHints={showRoleHints}
              onPlace={() => placeSelectedInSlot('slot1')}
              onRemove={() => removeFromSlot('slot1')}
            />
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
              {mergedLabels.slot2}
            </div>
            <SlotCard
              label={mergedLabels.slot2}
              description="Put the finite verb here"
              token={slot2Token}
              status={slot2Status()}
              showRoleHints={showRoleHints}
              onPlace={() => placeSelectedInSlot('slot2')}
              onRemove={() => removeFromSlot('slot2')}
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {mergedLabels.rest}
          </div>
          <div className="rounded-2xl border p-3">
            {rest.length === 0 ? (
              <p className="text-sm text-zinc-500">Add the remaining parts of the sentence here.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {rest.map((id, index) => {
                  const token = getTokenById(initialTokens, id);
                  if (!token) return null;

                  return (
                    <RestItem
                      key={id}
                      token={token}
                      index={index}
                      lastIndex={rest.length - 1}
                      showRoleHints={showRoleHints}
                      status={restItemStatus(index, id)}
                      onLeft={() => moveRest(index, 'left')}
                      onRight={() => moveRest(index, 'right')}
                      onRemove={() => removeRest(index)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={checkAnswer}
          className="rounded-2xl border px-4 py-2 font-medium shadow-sm"
        >
          {mergedLabels.check}
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="rounded-2xl border px-4 py-2 font-medium shadow-sm"
        >
          {mergedLabels.reset}
        </button>
        {canRevealAnswer ? (
          <button
            type="button"
            onClick={revealAnswer}
            className="rounded-2xl border px-4 py-2 font-medium shadow-sm"
          >
            {mergedLabels.reveal}
          </button>
        ) : null}
      </div>

      {feedback ? (
        <div
          className={[
            'mt-5 rounded-2xl border p-4',
            isCorrect
              ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30'
              : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30',
          ].join(' ')}
        >
          <div className="font-semibold">{feedback.title}</div>
          <p className="mt-1 text-sm">{feedback.body}</p>

          {feedback.extra ? (
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              {feedback.extra}
            </p>
          ) : null}

          {!isCorrect ? (
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              Farsi tip: Persian often keeps the verb later in the clause, but Dutch usually moves the finite verb into second position in main clauses.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
