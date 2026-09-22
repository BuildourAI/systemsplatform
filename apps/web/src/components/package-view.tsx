"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { buildManifest } from "@/lib/manifest";
import { buildPackage, KICKOFF } from "@/lib/package";

export function PackageView() {
  const { cart, ready, itemCount, size, warnings } = useCart();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const manifest = useMemo(
    () =>
      buildManifest(
        cart,
        warnings.map((warning) => ({
          itemId: warning.itemId,
          relation: warning.relation,
          relatedId: warning.relatedId,
        })),
      ),
    [cart, warnings],
  );

  const files = useMemo(() => buildPackage(manifest), [manifest]);

  if (!ready) {
    return (
      <div className="shell package">
        <p className="field__help">Loading&hellip;</p>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="shell shell--narrow package">
        <div className="cart-empty">
          <h1 style={{ fontSize: "var(--step-3)" }}>There is no plan to build yet</h1>
          <Link href="/systems" className="btn btn--primary">
            Browse systems
          </Link>
        </div>
      </div>
    );
  }

  const download = async () => {
    setBusy(true);
    setError(null);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const root = zip.folder(manifest.project.slug)!;

      for (const [path, contents] of Object.entries(files)) {
        root.file(path, contents);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${manifest.project.slug}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("The download did not start. Try again, or use a different browser.");
    } finally {
      setBusy(false);
    }
  };

  const copyKickoff = async () => {
    try {
      await navigator.clipboard.writeText(KICKOFF);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Select the line and copy it by hand.");
    }
  };

  const paths = Object.keys(files).sort();

  return (
    <div className="shell shell--narrow package">
      <div className="package__banner">
        <p className="eyebrow">Your plan is ready</p>
        <h1>{manifest.project.name}</h1>
        <p className="tnum">
          {itemCount} things &middot; {size.phases} build phases &middot; {paths.length} files
        </p>
        <button type="button" className="btn btn--primary" onClick={download} disabled={busy}>
          {busy ? "Preparing…" : "Download the plan"}
        </button>
      </div>

      {error ? (
        <div className="notice" style={{ marginBottom: "2rem" }}>
          <span className="notice__head">That did not work</span>
          <span>{error}</span>
        </div>
      ) : null}

      <h2 style={{ fontSize: "var(--step-2)", marginBottom: "1.25rem" }}>How to build it</h2>

      <div className="run-steps">
        <div className="run-step">
          <span className="run-step__n tnum">1</span>
          <div>
            <h3>Install Claude Code</h3>
            <p>
              Go to claude.com/claude-code and follow the instructions for your computer. It takes a
              few minutes. You will need a Claude account.
            </p>
          </div>
        </div>

        <div className="run-step">
          <span className="run-step__n tnum">2</span>
          <div>
            <h3>Open the folder</h3>
            <p>
              Unzip the download somewhere you can find again, like your Documents folder. Open a
              terminal in that folder and type:
            </p>
            <div className="code-line">
              <code>claude</code>
            </div>
          </div>
        </div>

        <div className="run-step">
          <span className="run-step__n tnum">3</span>
          <div>
            <h3>Paste this line</h3>
            <p>Claude reads your plan and starts building. It will tell you when each part is ready to try.</p>
            <div className="code-line">
              <code>{KICKOFF}</code>
              <button type="button" className="btn btn--quiet btn--sm" onClick={copyKickoff}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: "var(--step-2)", marginBottom: "0.75rem" }}>What is in the download</h2>
      <p className="field__help" style={{ marginBottom: "0.85rem" }}>
        Everything here was written from your cart. Nothing is generic.
      </p>
      <pre className="file-tree">
        {manifest.project.slug}/{"\n"}
        {paths.map((path) => `  ${path}\n`).join("")}
      </pre>

      <div className="row" style={{ marginTop: "2rem" }}>
        <Link href="/review" className="btn btn--quiet">
          Back to the summary
        </Link>
        <Link href="/systems" className="btn btn--bare">
          Start another system
        </Link>
      </div>
    </div>
  );
}
