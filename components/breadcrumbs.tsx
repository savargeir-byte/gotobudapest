import Link from "next/link";
import JsonLd from "./json-ld";
import { absoluteUrl } from "../lib/site";

export type Crumb = { name: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ name: "Home", href: "/" }, ...items];
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        {all.map((c, i) => (
          <span key={c.name} style={{ display: "contents" }}>
            {i > 0 ? <span aria-hidden="true">/</span> : null}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href}>{c.name}</Link>
            ) : (
              <span aria-current={i === all.length - 1 ? "page" : undefined}>
                {c.name}
              </span>
            )}
          </span>
        ))}
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            ...(c.href ? { item: absoluteUrl(c.href) } : {}),
          })),
        }}
      />
    </>
  );
}
