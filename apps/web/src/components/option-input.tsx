"use client";

import type { Option } from "@buildour/catalog";
import { normaliseChoice } from "@buildour/catalog";

/**
 * Renders one catalog option by its type.
 *
 * Every type ends up as a labelled control with the same edges and spacing, so a
 * panel of eight mixed questions still reads as one object rather than eight.
 */
export function OptionInput({
  option,
  value,
  onChange,
  idPrefix,
}: {
  option: Option;
  value: unknown;
  onChange: (value: unknown) => void;
  idPrefix: string;
}) {
  const id = `${idPrefix}-${option.key}`;
  const choices = (option.choices ?? []).map(normaliseChoice);

  return (
    <div className="field">
      <label className="field__label" htmlFor={id} id={`${id}-label`}>
        {option.label}
      </label>
      {option.help ? <p className="field__help">{option.help}</p> : null}

      {option.type === "select" ? (
        <div className="choice-list" role="radiogroup" aria-labelledby={`${id}-label`}>
          {choices.map((choice) => {
            const selected = value === choice.value;
            return (
              <label className="choice" key={choice.value} data-selected={selected}>
                <input
                  type="radio"
                  id={`${id}-${choice.value}`}
                  name={id}
                  checked={selected}
                  onChange={() => onChange(choice.value)}
                />
                <span className="choice__body">
                  <span className="choice__label">{choice.label}</span>
                  {choice.hint ? <span className="choice__hint">{choice.hint}</span> : null}
                </span>
              </label>
            );
          })}
        </div>
      ) : null}

      {option.type === "multiselect" ? (
        <div className="choice-list" role="group" aria-labelledby={`${id}-label`}>
          {choices.map((choice) => {
            const list = Array.isArray(value) ? (value as string[]) : [];
            const selected = list.includes(choice.value);
            return (
              <label className="choice" key={choice.value} data-selected={selected}>
                <input
                  type="checkbox"
                  id={`${id}-${choice.value}`}
                  checked={selected}
                  onChange={() =>
                    onChange(
                      selected
                        ? list.filter((entry) => entry !== choice.value)
                        : [...list, choice.value],
                    )
                  }
                />
                <span className="choice__body">
                  <span className="choice__label">{choice.label}</span>
                  {choice.hint ? <span className="choice__hint">{choice.hint}</span> : null}
                </span>
              </label>
            );
          })}
        </div>
      ) : null}

      {option.type === "boolean" ? (
        <div className="choice-list">
          {[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ].map((choice) => (
            <label className="choice" key={String(choice.value)} data-selected={value === choice.value}>
              <input
                type="radio"
                id={`${id}-${choice.value}`}
                name={id}
                checked={value === choice.value}
                onChange={() => onChange(choice.value)}
              />
              <span className="choice__body">
                <span className="choice__label">{choice.label}</span>
              </span>
            </label>
          ))}
        </div>
      ) : null}

      {option.type === "number" || option.type === "currency" ? (
        <div className="row">
          <input
            id={id}
            className="input tnum"
            type="number"
            inputMode="numeric"
            style={{ maxWidth: "12rem" }}
            value={value === undefined || value === null ? "" : String(value)}
            min={option.min}
            max={option.max}
            onChange={(event) =>
              onChange(event.target.value === "" ? null : Number(event.target.value))
            }
          />
          {option.unit ? <span className="field__help">{option.unit}</span> : null}
        </div>
      ) : null}

      {option.type === "text" || option.type === "date" ? (
        <input
          id={id}
          className="input"
          type={option.type === "date" ? "date" : "text"}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}
    </div>
  );
}
