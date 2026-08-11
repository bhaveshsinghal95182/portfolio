import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const PAPER = "#e3e4d8";
const INK = "#141414";
const MUTED = "#353535";
const ACCENT = "#e65959";

interface LoadedFont {
  name: string;
  data: ArrayBuffer;
  style: "normal";
  weight: 400 | 700;
}

/** The handwriting font is what makes the card unmistakably his — but never
 *  fail a build over it, so a missing/unparseable file just degrades. */
async function loadSignatureFont(): Promise<ArrayBuffer | null> {
  try {
    const data = await readFile(
      join(process.cwd(), "public", "font", "Southera.ttf"),
    );
    // Copy out of the pooled Buffer so we hand over a standalone ArrayBuffer.
    return Uint8Array.from(data).buffer as ArrayBuffer;
  } catch {
    return null;
  }
}

/**
 * Satori cannot read woff2, and Google only serves it to modern user agents —
 * an old UA string gets a plain truetype URL back instead.
 */
async function loadGoogleFont(
  family: string,
  weight: number,
): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`;
    const css = await fetch(cssUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    }).then((response) => (response.ok ? response.text() : ""));

    const url = css.match(
      /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/,
    )?.[1];
    if (!url) return null;

    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

interface OgImageOptions {
  /** Small uppercase label above the title, e.g. "Case study". */
  kicker?: string;
  title: string;
  subtitle?: string;
}

export async function renderOgImage({
  kicker,
  title,
  subtitle,
}: OgImageOptions) {
  const [signature, serif, sans] = await Promise.all([
    loadSignatureFont(),
    loadGoogleFont("Playfair Display", 700),
    loadGoogleFont("Jost", 400),
  ]);

  // Order matters: satori falls back to the first entry for any text that does
  // not name a family it has, so the readable one goes first.
  const fonts: LoadedFont[] = [];
  if (sans) {
    fonts.push({ name: "Jost", data: sans, style: "normal", weight: 400 });
  }
  if (serif) {
    fonts.push({
      name: "Playfair",
      data: serif,
      style: "normal",
      weight: 700,
    });
  }
  if (signature) {
    fonts.push({
      name: "Southera",
      data: signature,
      style: "normal",
      weight: 400,
    });
  }

  const titleFamily = serif ? "Playfair" : undefined;
  const bodyFamily = sans ? "Jost" : titleFamily;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: PAPER,
          padding: "64px 72px",
          border: `2px solid ${INK}`,
          ...(bodyFamily ? { fontFamily: bodyFamily } : {}),
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {kicker ? (
            <div
              style={{
                fontSize: 24,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: ACCENT,
                marginBottom: 24,
              }}
            >
              {kicker}
            </div>
          ) : null}
          <div
            style={{
              fontSize: title.length > 40 ? 72 : 92,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: INK,
              maxWidth: 980,
              ...(titleFamily ? { fontFamily: titleFamily } : {}),
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.35,
                color: MUTED,
                marginTop: 28,
                maxWidth: 900,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 4, backgroundColor: ACCENT }} />
            <div style={{ fontSize: 26, color: MUTED }}>
              {site.url.replace(/^https?:\/\//, "")}
            </div>
          </div>
          <div
            style={{
              fontSize: signature ? 66 : 34,
              color: INK,
              ...(signature ? { fontFamily: "Southera" } : {}),
            }}
          >
            {site.name}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
