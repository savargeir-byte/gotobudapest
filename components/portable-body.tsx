import { PortableText, type PortableTextComponents } from "next-sanity";
import type { PtBlock } from "@/lib/types";

// Portable Text is rendered through a closed set of components: plain blocks,
// lists, emphasis and links. Unknown block types and marks render nothing, and
// link targets are restricted to https, mailto and same-site paths, so editors
// cannot inject script, raw HTML or javascript: URLs.
function safeHref(href: unknown): string | undefined {
  if (typeof href !== "string") return undefined;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const u = new URL(href);
    return u.protocol === "https:" || u.protocol === "mailto:" ? href : undefined;
  } catch {
    return undefined;
  }
}

const components: PortableTextComponents = {
  types: {},
  unknownType: () => null,
  unknownMark: ({ children }) => <>{children}</>,
  marks: {
    link: ({ value, children }) => {
      const href = safeHref(value?.href);
      if (!href) return <>{children}</>;
      const external = !href.startsWith("/");
      return (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export default function PortableBody({ value }: { value: PtBlock[] }) {
  return <PortableText value={value as never} components={components} />;
}
