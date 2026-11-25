import type { Attraction } from "./types";
import { formatDistance } from "./nearby";

// Short, factual answers to the questions people ask about a place, built ONLY from data the page already holds
// (address, neighbourhoods, coordinates-based distances, Hungarian name, the official source). Nothing here is written per
// place by hand and nothing is invented: no hours, prices or availability. The same text is shown on the page and in FAQPage JSON-LD.
export type QuickAnswer = { question: string; answer: string; href?: string; hrefLabel?: string };

type Ctx = {
  neighbourhoods: { title: string; href: string }[];
  nearby: { place: { name: string; slug: string }; meters: number }[];
};

const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export function quickAnswersFor(a: Attraction, ctx: Ctx): QuickAnswer[] {
  const out: QuickAnswer[] = [];
  const hoods = ctx.neighbourhoods.slice(0, 2).map((n) => n.title);

  if (a.address) {
    const outside = a.notice && /outside Budapest/i.test(a.notice);
    out.push({
      question: `Where is ${a.name}?`,
      answer:
        `${a.name} is at ${a.address}.` +
        (hoods.length && !outside ? ` It is in ${list(hoods)}, one of the Budapest neighbourhoods covered on GoToBudapest.` : "") +
        (outside ? ` It lies outside Budapest, so allow time for the journey.` : ""),
      ...(ctx.neighbourhoods[0] && !outside ? { href: ctx.neighbourhoods[0].href, hrefLabel: `${ctx.neighbourhoods[0].title} neighbourhood guide` } : {}),
    });
  }

  if (a.nameHu && a.nameHu !== a.name)
    out.push({ question: `What is ${a.name} called in Hungarian?`, answer: `In Hungarian ${a.name} is ${a.nameHu}. Look for that name on signs, maps and timetables.` });

  if (ctx.nearby.length)
    out.push({
      question: `What is near ${a.name}?`,
      answer: `Places close to ${a.name} include ${list(ctx.nearby.slice(0, 3).map((n) => `${n.place.name} (about ${formatDistance(n.meters)} in a straight line)`))}. Distances are worked out from coordinates, not walking routes.`,
    });

  out.push({
    question: `Can I book tickets or a tour for ${a.name}?`,
    answer: `GoToBudapest does not sell tickets itself. When one of its booking partners lists a product that names ${a.name}, it appears in the tickets and tours panel on this page, and a row of broader Budapest tours may appear when none does. You choose the date and pay on the provider's own site.`,
  });

  out.push({
    question: `Where can I check opening hours and prices for ${a.name}?`,
    answer: `Opening hours and prices change, so GoToBudapest does not publish them. Use the official or reference source linked on this page (${a.sourceLabel}) for current details.`,
    href: a.sourceUrl,
    hrefLabel: a.sourceLabel,
  });
  return out;
}
