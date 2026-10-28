import type { Guide, PtBlock } from "./types";

// Deterministic keys keep seeding idempotent and React keys stable.
function key(prefix: string, index: number) {
  return `${prefix}-${index}`;
}

export function textBlock(text: string, prefix: string, index: number): PtBlock {
  return {
    _type: "block",
    _key: key(prefix, index),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(prefix, index) + "-s", text, marks: [] }],
  };
}

export function bulletBlock(text: string, prefix: string, index: number): PtBlock {
  return {
    ...textBlock(text, prefix, index),
    listItem: "bullet",
    level: 1,
  };
}

// Paragraphs first, then an optional bullet list: the structure of the original
// hand-written guides and topic pages.
export function textToBlocks(
  paragraphs: string[],
  bullets: string[] | undefined,
  prefix: string,
): PtBlock[] {
  const blocks = paragraphs.map((p, i) => textBlock(p, prefix + "-p", i));
  (bullets ?? []).forEach((b, i) => blocks.push(bulletBlock(b, prefix + "-b", i)));
  return blocks;
}

export function blocksToPlainText(blocks: PtBlock[] | undefined): string {
  return (blocks ?? [])
    .map((b) => b.children.map((c) => c.text).join(""))
    .join("\n");
}

export function readingMinutes(guide: Guide) {
  const words = [
    guide.intro,
    ...guide.sections.flatMap((s) => [s.title, blocksToPlainText(s.body)]),
  ]
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 210));
}

export const sectionId = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
