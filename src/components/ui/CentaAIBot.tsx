"use client";
import React from "react";
import clsx from "clsx";

export function CentaAIBot({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <div className={clsx("ai-bot", !isLoading && "pause")}>
      <div className="head">
        <div className="face">
          <div className="eyes"></div>
          <div className="mouth"></div>
        </div>
      </div>

      <style jsx>{`
        /* --- Palette bindings (scoped to this component) --- */
        .ai-bot {
          /* Your brand palette */
          --color-error: #fe4b60;
          --color-brand: #00626f;
          --color-brandDark: #00626f;
          --color-success: #047857;
          --color-monzoGreen: #4bb78f;
          --color-monzoOrange: #f1bd76;
          --color-background: #001e3a;
          --color-primary: #14233c;
          --color-secondary: #ffb54d;
          --color-innerBg: #868e9c67;
          --color-textPrimary: #f6f7fb;
          --color-textSecondary: #8e8e93;

          /* Animation design tokens derived from palette */
          --c: var(--color-textPrimary); /* head plate + eye stripes */
          --c2: var(--color-monzoGreen); /* eye glow + mouth */
          --c3: var(--color-secondary); /* eye accent gradient */
          --surface: var(--color-primary); /* face background */
        }

        @layer properties {
          @property --elh {
            syntax: "<number>";
            inherits: true;
            initial-value: 1;
          }
          @property --erx {
            syntax: "<percentage>";
            inherits: true;
            initial-value: 0%;
          }
          @property --fx {
            syntax: "<percentage>";
            inherits: true;
            initial-value: 0%;
          }
          @property --ealw {
            syntax: "<number>";
            inherits: true;
            initial-value: 1;
          }
          @property --earw {
            syntax: "<number>";
            inherits: true;
            initial-value: 1;
          }
          @property --erh {
            syntax: "<number>";
            inherits: true;
            initial-value: 1;
          }
          @property --mh {
            syntax: "<number>";
            inherits: true;
            initial-value: 1;
          }
          @property --mw {
            syntax: "<number>";
            inherits: true;
            initial-value: 1;
          }
        }

        .ai-bot {
          width: 40px;
          aspect-ratio: 1;
          position: relative;
          display: grid;
          place-items: center;
          scale: 1.1;
          animation: ${isLoading
            ? "blink 2.4s ease infinite, move-head 4.2s linear infinite, mouth 1.2s ease-in infinite"
            : "none"};
        }

        .head {
          background: linear-gradient(
            var(--color-innerBg) 80%,
            color-mix(in srgb, var(--color-innerBg), black 30%),
            var(--color-innerBg)
          );
          border-radius: 0.375rem;
          position: absolute;
          width: 34px;
          height: 24px;
        }
        .head::before,
        .head::after {
          content: "";
          position: absolute;
          top: 6px;
          width: 4px;
          height: 12px;
          background: var(--color-innerBg);
          border-radius: 2px;
        }
        .head::before {
          left: -6px;
          scale: var(--ealw, 1) 1;
        }
        .head::after {
          right: -6px;
          scale: var(--earw, 1) 1;
        }

        .face {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: absolute;
          inset: 0 3px;
          background: var(--surface);
          translate: var(--fx) 0;
          border-radius: 4px;
          padding: 4px 4px 2px 4px;
          gap: 3px;
        }

        .eyes {
          display: flex;
          height: 8px;
          gap: 6px;
        }
        .eyes::before,
        .eyes::after {
          content: "";
          width: 5px;
          height: 8px;
          scale: 1 var(--elh);
          filter: drop-shadow(0 0 2px var(--c2));
          background: repeating-linear-gradient(
              to bottom,
              var(--c),
              var(--c) 0.25px,
              transparent 0.25px,
              transparent 0.6px
            ),
            linear-gradient(to bottom, var(--c3), transparent 60%), var(--c2);
          border-radius: 1px;
          translate: var(--erx) 0;
        }
        .eyes::after {
          scale: 1 var(--erh);
        }

        .mouth {
          width: 10px;
          height: 2px;
          background: var(--c2);
          border-radius: 0 0 1px 1px;
          filter: drop-shadow(0 0 2px var(--c2));
          scale: var(--mw, 1) var(--mh, 1);
        }

        @keyframes blink {
          0%,
          10%,
          100% {
            --elh: 1;
            --erh: 1;
          }
          2% {
            --elh: 0.2;
          }
          8% {
            --erh: 0.1;
          }
        }

        @keyframes mouth {
          0%,
          30%,
          70%,
          100% {
            --mh: 1;
            --mw: 1;
          }
          20% {
            --mh: 0.5;
          }
          60% {
            --mw: 0.7;
          }
        }

        @keyframes move-head {
          0%,
          20%,
          40%,
          100% {
            --erx: 0%;
            --fx: 0%;
            --ealw: 1;
            --earw: 1;
          }
          10% {
            --erx: 20%;
            --fx: 10%;
            --ealw: 1.5;
            --earw: 0.5;
          }
          30% {
            --erx: -20%;
            --fx: -10%;
            --ealw: 0.5;
            --earw: 1.5;
          }
        }

        .pause {
          animation: none !important;
        }
      `}</style>
    </div>
  );
}
