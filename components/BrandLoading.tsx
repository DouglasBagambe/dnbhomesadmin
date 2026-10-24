"use client";

import { useId } from "react";

/** The signature mark only: draw, hold and softly fade. No artificial delay. */
export function BrandLoading({ label = "Loading", inline = false }: { label?: string; inline?: boolean }) {
  const mask = useId();
  return (
    <span className={`brand-loading${inline ? " brand-loading-inline" : ""}`} role="status" aria-label={label}>
      <svg viewBox="240 280 540 460" fill="none" aria-hidden="true" focusable="false">
        <defs>
          <mask id={mask} maskUnits="userSpaceOnUse" x="240" y="280" width="540" height="460">
            <rect x="240" y="280" width="540" height="460" fill="white" />
            <g stroke="black" strokeWidth="76" strokeLinecap="round">
              <path d="M320,318 C380,350 445,430 445,540" />
              <path d="M440,345 C520,335 610,360 655,430 C700,500 705,600 670,660" />
            </g>
          </mask>
        </defs>
        <g className="brand-loading-cycle" stroke="currentColor" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round">
          <path className="brand-loading-draw" mask={`url(#${mask})`} pathLength="1" d="M320,318 C380,350 445,430 445,540 C445,640 410,700 355,700 C295,700 280,620 282,540 C285,470 315,425 345,395 C380,360 400,350 440,345 C520,335 610,360 655,430 C700,500 705,600 670,660 C645,705 600,710 580,680 C555,645 565,560 610,490 C640,445 670,420 745,398" />
          <g className="brand-loading-crossings">
            <path d="M320,318 C380,350 445,430 445,540" />
            <path d="M440,345 C520,335 610,360 655,430 C700,500 705,600 670,660" />
          </g>
        </g>
      </svg>
    </span>
  );
}
