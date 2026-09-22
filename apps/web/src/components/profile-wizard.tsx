"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { visibleOptions } from "@buildour/catalog";
import { catalog } from "@/lib/catalog";
import { useCart } from "@/lib/cart-context";
import { OptionInput } from "./option-input";

/**
 * One question per screen. Short, skippable and resumable: nothing here is
 * required to shop, it only sets better defaults further in.
 */
export function ProfileWizard() {
  const { cart, setProfile, ready } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(0);

  const questions = visibleOptions(catalog.profile_questions, {
    business: cart.profile,
    system: {},
    options: {},
  });

  if (!ready) {
    return (
      <div className="shell wizard">
        <p className="field__help">Loading&hellip;</p>
      </div>
    );
  }

  const done = step >= questions.length;
  const question = questions[step];
  const progress = Math.round((Math.min(step, questions.length) / questions.length) * 100);

  if (done) {
    return (
      <div className="shell shell--narrow wizard">
        <div className="wizard__progress">
          <div className="wizard__bar" style={{ width: "100%" }} />
        </div>
        <div className="wizard__step">
          <p className="eyebrow">All done</p>
          <h1 className="wizard__q">
            Thanks. We will use this to fill in sensible answers as you go.
          </h1>
          <p className="lede">
            You can change any of it later, and you can change every answer we pre-fill.
          </p>
          <div className="wizard__foot">
            <Link href="/systems" className="btn btn--primary">
              Browse systems
            </Link>
            <button type="button" className="btn btn--bare" onClick={() => setStep(0)}>
              Go back over my answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  const value = cart.profile[question.key];
  const answered = value !== undefined && value !== null && value !== "";

  const next = () => {
    const last = step === questions.length - 1;
    if (last) setProfile({}, true);
    setStep(step + 1);
  };

  return (
    <div className="shell shell--narrow wizard">
      <div className="wizard__progress">
        <div className="wizard__bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="wizard__step">
        <p className="wizard__count tnum">
          Question {step + 1} of {questions.length}
        </p>
        <h1 className="wizard__q">{question.label}</h1>

        <OptionInput
          option={{ ...question, label: "", help: question.help }}
          idPrefix="profile"
          value={value}
          onChange={(next) => setProfile({ [question.key]: next })}
        />

        <div className="wizard__foot">
          <button type="button" className="btn btn--primary" onClick={next}>
            {answered ? "Next" : "Skip this one"}
          </button>
          {step > 0 ? (
            <button type="button" className="btn btn--bare" onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : null}
          <span style={{ marginLeft: "auto" }}>
            <Link href="/systems" className="btn btn--bare">
              Skip all this and browse
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
