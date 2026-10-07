"use client";

import { Check, ChevronRight, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { isTodo, type BayanContent, type Card } from "../content";
import type { BayanSession } from "../session";
import type { Dialog } from "../stores";
import { useNumberToken, useUi } from "../useBayan";
import { Portrait } from "./Portrait";

interface DialogBoxProps {
  session: BayanSession;
  content: BayanContent;
  peopleSheet: string;
  peopleRows: Record<string, number> | null;
}

/**
 * While a conversation is open, Enter and Space belong to it. A control inside the conversation
 * handles its own key; anywhere else, such as a corner button, must not take the key instead.
 */
function ownKey(event: KeyboardEvent, box: HTMLElement | null): boolean {
  const target = event.target;
  if (target instanceof HTMLElement && target.closest("input, textarea, select")) return false;
  return !(target instanceof Node && box?.contains(target) && target instanceof HTMLButtonElement);
}

const actionButton =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-ink bg-gold px-6 py-2 text-game-small font-semibold text-ink shadow-game hover:bg-gold/85";

/** The conversation at the bottom of the screen: who speaks, what they say, and any question. */
export function DialogBox(props: DialogBoxProps) {
  const dialog = useUi(props.session, (state) => state.dialog);
  if (!dialog) return null;
  const beat = dialog.beats[dialog.index];
  // A new key per beat starts its typing afresh. Lines added after an answer must not restart the question.
  const key = `${dialog.index}:${JSON.stringify(beat)}`;
  if (beat.kind === "card") return <StoryCard key={key} session={props.session} card={beat.card} last={isLast(dialog)} />;
  return <Conversation key={key} {...props} dialog={dialog} />;
}

function isLast(dialog: Dialog): boolean {
  return dialog.index === dialog.beats.length - 1;
}

function Conversation({ session, content, dialog, peopleSheet, peopleRows }: DialogBoxProps & { dialog: Dialog }) {
  const beat = dialog.beats[dialog.index];
  const question = beat.kind === "ask" ? content.lots[beat.lot].questions[beat.question] : null;
  const speaker = beat.kind === "say" ? beat.speaker : (question?.speaker ?? "");
  const text = beat.kind === "say" ? beat.text : (question?.prompt ?? "");
  const letterMs = useNumberToken("--game-letter-ms", 26);
  const pauseMs = useNumberToken("--game-answer-pause-ms", 1100);
  const [shown, setShown] = useState(0);
  const typing = shown < text.length;
  const { director, bus } = session;
  const box = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!typing) return;
    const timer = window.setTimeout(() => {
      setShown((count) => count + 1);
      if (shown % 2 === 0) bus.emit({ type: "blip" });
    }, letterMs);
    return () => window.clearTimeout(timer);
  }, [typing, shown, letterMs, bus]);

  // After a right answer, let it sink in for a moment, then carry on.
  useEffect(() => {
    if (dialog.solved === null) return;
    const timer = window.setTimeout(() => director.next(), pauseMs);
    return () => window.clearTimeout(timer);
  }, [dialog.solved, director, pauseMs]);

  const advance = useCallback(() => {
    if (typing) setShown(text.length);
    else director.next();
  }, [typing, text.length, director]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (question && ["1", "2", "3"].includes(event.key)) {
        if (!(event.target instanceof HTMLElement && event.target.closest("input, textarea, select"))) {
          setShown(text.length);
          director.choose(Number(event.key) - 1);
        }
        return;
      }
      if (!ownKey(event, box.current)) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (question) setShown(text.length);
        else advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, text.length, advance, director]);

  // On a question, focus the box rather than a choice, so an Enter meant to skip a line never picks an answer.
  useEffect(() => {
    if (question) box.current?.focus();
  }, [question]);

  const person = content.people[speaker];
  const name = person?.name ?? speaker;
  const hint = dialog.hint;
  const solved = dialog.solved !== null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-game-gap">
      <section
        ref={box}
        tabIndex={-1}
        role="dialog"
        aria-label={name}
        className="pointer-events-auto relative flex w-full max-w-dialog animate-pop-in flex-col items-start outline-none"
      >
        {/* The name plate, big enough to read from the back of the room. */}
        <p className="pixel rounded-t-xl border-[3px] border-b-0 border-ink bg-ink px-5 pb-1 pt-1.5 text-game-name lowercase text-paper">
          {name}
        </p>
        <div className="flex w-full flex-col gap-game-gap rounded-2xl rounded-tl-none border-[3px] border-ink bg-paper p-game-gap shadow-game">
          <div className="flex items-start gap-game-gap">
            {person && (
              <div className="shrink-0 rounded-xl border-[3px] border-ink bg-wash p-1">
                <Portrait sheet={peopleSheet} rows={peopleRows} sprite={person.sprite} />
              </div>
            )}
            <p
              className={`min-w-0 flex-1 self-center text-game text-ink ${question ? "font-semibold" : "font-medium"}`}
              aria-live="polite"
            >
              {text.slice(0, shown)}
              <span aria-hidden className="invisible">
                {text.slice(shown)}
              </span>
            </p>
          </div>

          {question ? (
            <>
              <ol className="grid w-full gap-2 @3xl:grid-cols-3">
                {question.choices.map((choice, i) => {
                  const tried = dialog.tried.includes(i);
                  const right = dialog.solved === i;
                  return (
                    <li key={choice}>
                      <button
                        type="button"
                        disabled={tried || solved}
                        onClick={() => director.choose(i)}
                        className={`flex size-full min-h-11 items-center gap-3 rounded-xl border-[3px] px-4 py-3 text-left text-game-choice font-medium transition-colors ${
                          right
                            ? "border-leaf bg-leaf text-paper"
                            : tried
                              ? "animate-shake border-ink/20 bg-wash text-muted line-through"
                              : "border-ink bg-paper hover:bg-gold/30"
                        } ${solved && !right ? "opacity-40" : ""}`}
                      >
                        <span
                          aria-hidden
                          className={`pixel flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-game-small ${
                            right ? "border-paper bg-paper text-leaf" : "border-current"
                          }`}
                        >
                          {right ? <Check className="size-5" strokeWidth={3} /> : i + 1}
                        </span>
                        <span>{choice}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              {hint && !solved && (
                <div key={dialog.tried.length} role="alert" className="flex w-full animate-shake items-start gap-3">
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink bg-coral px-3 py-1 text-game-small font-bold text-ink">
                    <RotateCcw aria-hidden className="size-4" strokeWidth={3} />
                    {content.feedback.tryAgain}
                  </span>
                  <p className="text-game-small font-medium text-ink">
                    <span className="pixel lowercase">{content.people[hint.speaker]?.name ?? hint.speaker}: </span>
                    {hint.text}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex w-full justify-end">
              <button type="button" autoFocus onClick={advance} className={actionButton}>
                {typing ? "Skip" : isLast(dialog) ? "Close" : "Next"}
                <ChevronRight aria-hidden className="size-5" strokeWidth={3} />
              </button>
            </div>
          )}
        </div>

        {/* A big, unmissable "That's right!" over the box. */}
        {solved && (
          <p
            role="status"
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex w-max -translate-y-1/2 animate-pop-in items-center gap-2 rounded-full border-[3px] border-ink bg-leaf px-6 py-2 text-game-title font-bold text-paper shadow-game"
          >
            <Check aria-hidden className="size-8" strokeWidth={3.5} />
            {content.feedback.right}
          </p>
        )}
      </section>
    </div>
  );
}

function StoryCard({ session, card, last }: { session: BayanSession; card: Card; last: boolean }) {
  const { director } = session;
  const box = useRef<HTMLElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!ownKey(event, box.current)) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        director.next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [director]);

  const todo = isTodo(card.body);
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink/40 p-game-gap">
      <section
        ref={box}
        role="dialog"
        aria-label={card.title}
        className="flex w-full max-w-dialog animate-pop-in flex-col gap-game-gap rounded-2xl border-[3px] border-ink bg-paper p-game-gap shadow-game"
      >
        <h2 className="pixel text-game-title lowercase">{card.title}</h2>
        <p className={`text-game ${todo ? "italic text-muted" : "font-medium"}`}>{todo ? "To be added by the teacher." : card.body}</p>
        <div className="flex justify-end">
          <button type="button" autoFocus onClick={() => director.next()} className={actionButton}>
            {last ? "Continue" : "Next"}
            <ChevronRight aria-hidden className="size-5" strokeWidth={3} />
          </button>
        </div>
      </section>
    </div>
  );
}
