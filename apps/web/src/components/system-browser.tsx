"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { browsableSystems, industries, useCases, itemsForSystem } from "@/lib/catalog";

/**
 * Browse by industry or by use case, the two ways the reference site lets
 * people in. Filters narrow rather than hide: a system that matches nothing
 * still appears if no filter is set.
 */
export function SystemBrowser() {
  const [industry, setIndustry] = useState<string | null>(null);
  const [useCase, setUseCase] = useState<string | null>(null);

  const systems = useMemo(() => {
    return browsableSystems().filter((system) => {
      if (industry && !system.domains.includes(industry)) return false;
      if (useCase && !system.use_cases.includes(useCase)) return false;
      return true;
    });
  }, [industry, useCase]);

  return (
    <>
      <div className="filters">
        <div className="filters__row">
          <span className="filters__label" id="filter-industry">
            My business
          </span>
          <div className="row" role="group" aria-labelledby="filter-industry">
            {industries.map((domain) => (
              <button
                key={domain.id}
                type="button"
                className="filter-chip"
                aria-pressed={industry === domain.id}
                onClick={() => setIndustry(industry === domain.id ? null : domain.id)}
              >
                {domain.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filters__row">
          <span className="filters__label" id="filter-usecase">
            I want to fix
          </span>
          <div className="row" role="group" aria-labelledby="filter-usecase">
            {useCases.map((domain) => (
              <button
                key={domain.id}
                type="button"
                className="filter-chip"
                aria-pressed={useCase === domain.id}
                onClick={() => setUseCase(useCase === domain.id ? null : domain.id)}
              >
                {domain.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {systems.length === 0 ? (
        <div className="notice notice--soft">
          <span className="notice__head">Nothing matches both of those yet</span>
          <span>Try clearing one of the filters.</span>
        </div>
      ) : (
        <div className="system-grid">
          {systems.map((system) => {
            const count = itemsForSystem(system.id).length;
            const live = system.status === "live";

            const inner = (
              <>
                <div className="system-card__top">
                  <h3>{system.name}</h3>
                  {live ? null : <span className="tag-soon">Soon</span>}
                </div>
                <p className="system-card__tagline">{system.tagline}</p>
                <div className="system-card__meta">
                  {live ? (
                    <span className="tnum">{count} things to choose from</span>
                  ) : (
                    <span>Being written now</span>
                  )}
                </div>
              </>
            );

            return live ? (
              <Link
                key={system.id}
                href={`/systems/${system.id}`}
                className="system-card system-card--live"
              >
                {inner}
              </Link>
            ) : (
              <div key={system.id} className="system-card system-card--soon">
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
