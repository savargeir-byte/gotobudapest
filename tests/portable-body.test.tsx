import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import PortableBody from "../components/portable-body";
import { textToBlocks } from "../lib/portable-text";
import type { PtBlock } from "../lib/types";

const block = (
  text: string,
  marks: string[] = [],
  markDefs: PtBlock["markDefs"] = [],
): PtBlock => ({
  _type: "block",
  _key: "k" + Math.random().toString(36).slice(2),
  style: "normal",
  markDefs,
  children: [{ _type: "span", _key: "s1", text, marks }],
});

test("renders paragraphs and bullet lists", () => {
  const html = renderToStaticMarkup(
    <PortableBody value={textToBlocks(["Hello"], ["One", "Two"], "t")} />,
  );
  assert.match(html, /<p>Hello<\/p>/);
  assert.match(html, /<ul><li>One<\/li><li>Two<\/li><\/ul>/);
});

test("escapes markup typed into text", () => {
  const html = renderToStaticMarkup(
    <PortableBody value={[block('<script>alert(1)</script><img src=x onerror=alert(1)>')]} />,
  );
  assert.ok(!html.includes("<script"));
  assert.ok(!html.includes("<img"));
  assert.match(html, /&lt;script&gt;/);
});

test("drops javascript:, data: and protocol-relative link targets", () => {
  for (const href of [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html;base64,PHNjcmlwdD4=",
    "//evil.example/x",
    "http://insecure.example",
    "vbscript:msgbox(1)",
  ]) {
    const html = renderToStaticMarkup(
      <PortableBody
        value={[block("click", ["l1"], [{ _key: "l1", _type: "link", href }])]}
      />,
    );
    assert.ok(!html.includes("<a"), `link survived for ${href}`);
    assert.match(html, /click/);
  }
});

test("keeps https, mailto and same-site links with safe rel attributes", () => {
  const ext = renderToStaticMarkup(
    <PortableBody
      value={[block("a", ["l1"], [{ _key: "l1", _type: "link", href: "https://example.com/x" }])]}
    />,
  );
  assert.match(ext, /href="https:\/\/example\.com\/x"/);
  assert.match(ext, /rel="noopener noreferrer"/);
  assert.match(ext, /target="_blank"/);
  const internal = renderToStaticMarkup(
    <PortableBody
      value={[block("a", ["l1"], [{ _key: "l1", _type: "link", href: "/guides" }])]}
    />,
  );
  assert.match(internal, /href="\/guides"/);
  assert.ok(!internal.includes("target="));
  const mail = renderToStaticMarkup(
    <PortableBody
      value={[block("a", ["l1"], [{ _key: "l1", _type: "link", href: "mailto:a@b.co" }])]}
    />,
  );
  assert.match(mail, /href="mailto:a@b\.co"/);
});

test("ignores unknown block types such as raw HTML or embeds", () => {
  const value = [
    { _type: "html", _key: "h", html: "<script>alert(1)</script>" },
    { _type: "embed", _key: "e", url: "https://evil.example" },
    block("safe"),
  ] as unknown as PtBlock[];
  const html = renderToStaticMarkup(<PortableBody value={value} />);
  assert.ok(!html.includes("script"));
  assert.ok(!html.includes("evil.example"));
  assert.match(html, /safe/);
});
