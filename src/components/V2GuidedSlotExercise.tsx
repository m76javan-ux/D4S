import React, { useEffect, useMemo, useState } from 'react';
import { Mic } from 'lucide-react';
import { analyzePronunciation } from '@/services/pronunciationService';

type TokenRole = 'subject' | 'verb' | 'object' | 'time' | 'place' | 'other';

type WordToken = {
  id: string;
  text: string;
  role?: TokenRole;
};

type V2GuidedExerciseData = {
  id: string;
  instruction?: string;
  hint?: string;
  explanation?: string;
  tokens: WordToken[];
  correctOrder: string[];
};

type CompletionResult = {
  exerciseId: string;
  isCorrect: boolean;
  userOrder: string[];
  targetOrder: string[];
};

type Props = {
  exercise: V2GuidedExerciseData;
  onComplete?: (result: CompletionResult) => void;
  beginnerMode?: boolean;
  lockSlot2ToVerb?: boolean;
};

type SlotValue = string | null;

function tokenById(tokens: WordToken[], id: string | null) {
  if (!id) return null;
  return tokens.find((t) => t.id === id) ?? null;
}

function roleLabel(role?: TokenRole) {
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
    default:
      return 'Word';
  }
}

function TokenChip({
  token,
  selected,
  disabled,
  highlighted,
  onClick,
}: {
  token: WordToken;
  selected?: boolean;
  disabled?: boolean;
  highlighted?: boolean;
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
        'rounded-2xl border px-4 py-3 text-sm shadow-sm transition text-left',
        selected ? 'ring-2 ring-zinc-500' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md',
        isVerb
          ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30'
          : 'bg-white dark:bg-zinc-900',
        highlighted ? 'ring-2 ring-blue-400' : '',
      ].join(' ')}
      title={roleLabel(token.role)}
    >
      <div className="font-medium">{token.text}</div>
      <div className="mt-1 text-xs text-zinc-500">{roleLabel(token.role)}</div>
      {isVerb ? (
        <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
          Finite verb candidate
        </div>
      ) : null}
    </button>
  );
}

function EmptySlot({
  label,
  description,
  emphasized = false,
  pulsing = false,
  onClick,
}: {
  label: string;
  description?: string;
  emphasized?: boolean;
  pulsing?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'min-h-[86px] rounded-2xl border-2 border-dashed px-4 py-3 text-left transition',
        emphasized
          ? 'border-blue-400 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/20'
          : 'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/40',
        pulsing ? 'animate-pulse' : '',
      ].join(' ')}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-sm text-zinc-500">
        {description || 'Choose a token'}
      </div>
    </button>
  );
}

export default function V2GuidedSlotExercise({
  exercise,
  onComplete,
  beginnerMode = true,
  lockSlot2ToVerb = true,
}: Props) {
  const initialTokens = useMemo(() => exercise.tokens, [exercise.tokens]);

  const [slot1, setSlot1] = useState<SlotValue>(null);
  const [slot2, setSlot2] = useState<SlotValue>(null);
  const [rest, setRest] = useState<string[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [coachMessage, setCoachMessage] = useState<string>('');
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
  const availableTokens = initialTokens.filter((t) => !usedIds.has(t.id));
  const orderedIds = [slot1, slot2, ...rest].filter(Boolean) as string[];
  const orderedTokens = orderedIds
    .map((id) => tokenById(initialTokens, id))
    .filter(Boolean) as WordToken[];

  const sentencePreview = orderedTokens.map((t) => t.text).join(' ');
  const selectedToken = tokenById(initialTokens, selectedTokenId);

  const correctSlot1 = exercise.correctOrder[0] ?? null;
  const correctSlot2 = exercise.correctOrder[1] ?? null;
  const correctRest = exercise.correctOrder.slice(2);

  const isComplete = orderedIds.length === (initialTokens?.length || 0);
  const isCorrect =
    orderedIds.length === (exercise.correctOrder?.length || 0) &&
    orderedIds.every((id, i) => id === exercise.correctOrder[i]);

  const slot2Token = tokenById(initialTokens, slot2);
  const slot2IsVerb = slot2Token?.role === 'verb';

  const availableVerbIds = availableTokens
    .filter((t) => t.role === 'verb')
    .map((t) => t.id);

  const shouldGuideToVerb =
    beginnerMode && !slot2 && availableVerbIds.length > 0;

  function chooseToken(id: string) {
    setSelectedTokenId((prev) => (prev === id ? null : id));
    setCoachMessage('');
    setChecked(false);
    setShowAnswer(false);
  }

  function placeInSlot1() {
    if (!selectedTokenId || slot1) return;
    setSlot1(selectedTokenId);
    setSelectedTokenId(null);
    setCoachMessage('');
    setChecked(false);
    setShowAnswer(false);
  }

  function placeInSlot2() {
    if (!selectedTokenId || slot2) return;

    const token = tokenById(initialTokens, selectedTokenId);

    if (lockSlot2ToVerb && token?.role !== 'verb') {
      setCoachMessage(
        'In beginner mode, slot 2 is reserved for the finite verb. Choose the blue verb token first.'
      );
      return;
    }

    setSlot2(selectedTokenId);
    setSelectedTokenId(null);
    setCoachMessage('');
    setChecked(false);
    setShowAnswer(false);
  }

  function addToRest() {
    if (!selectedTokenId) return;
    setRest((prev) => [...prev, selectedTokenId]);
    setSelectedTokenId(null);
    setCoachMessage('');
    setChecked(false);
    setShowAnswer(false);
  }

  function removeFromSlot(slot: 'slot1' | 'slot2') {
    if (slot === 'slot1') setSlot1(null);
    else setSlot2(null);
    setCoachMessage('');
    setChecked(false);
    setShowAnswer(false);
  }

  function moveRestItem(index: number, dir: 'left' | 'right') {
    setRest((prev) => {
      const next = [...prev];
      const swapIndex = dir === 'left' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= next.length) return prev;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
    setCoachMessage('');
    setChecked(false);
    setShowAnswer(false);
  }

  function removeRestItem(index: number) {
    setRest((prev) => prev.filter((_, i) => i !== index));
    setCoachMessage('');
    setChecked(false);
    setShowAnswer(false);
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
        'First place the finite verb in slot 2. Dutch main clauses usually need the verb there.'
      );
      return;
    }

    if (beginnerMode && slot2 && !slot2IsVerb) {
      setChecked(true);
      setCoachMessage(
        'Slot 2 should contain the finite verb. Replace the current token with the verb.'
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
      targetOrder: exercise.correctOrder,
    });
  }

  function feedbackMessage() {
    if (!checked) return null;

    if (coachMessage) {
      return {
        title: 'Guided hint',
        body: coachMessage,
      };
    }

    if (isCorrect) {
      return {
        title: 'Correct!',
        body: 'Goed zo — the finite verb is in slot 2 and the sentence is correct.',
      };
    }

    if (!slot2) {
      return {
        title: 'Start with slot 2',
        body: 'Find the verb and place it in slot 2 first.',
      };
    }

    if (!slot2IsVerb) {
      return {
        title: 'Verb needed in slot 2',
        body: 'Dutch main clauses normally place the finite verb in the second position.',
      };
    }

    return {
      title: 'Almost there',
      body: 'The verb is in the correct slot. Now adjust the remaining parts of the sentence.',
    };
  }

  const feedback = feedbackMessage();

  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm dark:bg-zinc-950">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">V2 Guided Sentence Builder</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {exercise.instruction || 'Build the Dutch sentence. Put the finite verb in slot 2.'}
        </p>
        {exercise.hint ? (
          <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
            {exercise.hint}
          </p>
        ) : null}
      </div>

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
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">Token bank</div>
            {beginnerMode ? (
              <div className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                Beginner mode
              </div>
            ) : null}
          </div>

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
                  onClick={() => chooseToken(token.id)}
                />
              ))
            )}
          </div>

          {beginnerMode ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Tip: the <span className="font-medium text-blue-700 dark:text-blue-300">blue token</span> is the verb. Put it in slot 2 first.
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border p-4">
          <div className="mb-3 text-sm font-semibold">Selected token</div>
          {selectedToken ? (
            <div className="rounded-2xl border p-3">
              <div className="font-medium">{selectedToken.text}</div>
              <div className="mt-1 text-sm text-zinc-500">
                {roleLabel(selectedToken.role)}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={placeInSlot1}
                  disabled={!!slot1}
                  className="rounded-2xl border px-4 py-2 text-sm shadow-sm disabled:opacity-50"
                >
                  Place in slot 1
                </button>
                <button
                  type="button"
                  onClick={placeInSlot2}
                  disabled={!!slot2}
                  className="rounded-2xl border px-4 py-2 text-sm shadow-sm disabled:opacity-50"
                >
                  Place in slot 2
                </button>
                <button
                  type="button"
                  onClick={addToRest}
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
              Slot 1
            </div>
            {slot1 ? (
              <div className="flex items-center justify-between rounded-2xl border p-3">
                <div>
                  <div className="font-medium">{tokenById(initialTokens, slot1)?.text}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {roleLabel(tokenById(initialTokens, slot1)?.role)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromSlot('slot1')}
                  className="rounded-xl border px-3 py-1 text-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <EmptySlot
                label="Slot 1"
                description="Topic, subject, time, or place"
                onClick={placeInSlot1}
              />
            )}
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
              Slot 2 — Finite Verb
            </div>
            {slot2 ? (
              <div
                className={[
                  'flex items-center justify-between rounded-2xl border p-3',
                  slot2IsVerb
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30'
                    : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30',
                ].join(' ')}
              >
                <div>
                  <div className="font-medium">{slot2Token?.text}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {roleLabel(slot2Token?.role)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromSlot('slot2')}
                  className="rounded-xl border px-3 py-1 text-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <EmptySlot
                label="Slot 2 — Finite Verb"
                description="Put the verb here first"
                emphasized
                pulsing={shouldGuideToVerb}
                onClick={placeInSlot2}
              />
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Rest of the sentence
          </div>
          <div className="rounded-2xl border p-3">
            {rest.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Add the remaining words or phrases here.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {rest.map((id, index) => {
                  const token = tokenById(initialTokens, id);
                  if (!token) return null;

                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded-2xl border p-3"
                    >
                      <div>
                        <div className="font-medium">{token.text}</div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {roleLabel(token.role)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => moveRestItem(index, 'left')}
                          disabled={index === 0}
                          className="rounded-xl border px-3 py-1 text-sm disabled:opacity-50"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => moveRestItem(index, 'right')}
                          disabled={index === rest.length - 1}
                          className="rounded-xl border px-3 py-1 text-sm disabled:opacity-50"
                        >
                          →
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRestItem(index)}
                          className="rounded-xl border px-3 py-1 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
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
          Check answer
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="rounded-2xl border px-4 py-2 font-medium shadow-sm"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={revealAnswer}
          className="rounded-2xl border px-4 py-2 font-medium shadow-sm"
        >
          Show answer
        </button>
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

          {!isCorrect && exercise.explanation ? (
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              {exercise.explanation}
            </p>
          ) : null}

          {!isCorrect ? (
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              Farsi tip: Persian often keeps the verb near the end, but Dutch main clauses usually pull the verb forward into position 2.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
