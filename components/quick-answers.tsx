import type { QuickAnswer } from "@/lib/quick-answers";

// Visible question-and-answer block (answer-first, plain text) for readers and for search and AI systems that quote pages.
// The FAQPage JSON-LD for the same entries is emitted by the page, so markup and visible text always match.
export default function QuickAnswers({ name, items }: { name: string; items: QuickAnswer[] }) {
  if (!items.length) return null;
  return (
    <section className="quick-answers" aria-labelledby="place-quick-answers" data-testid="quick-answers">
      <h2 id="place-quick-answers">Quick answers: {name}</h2>
      <dl>
        {items.map((q) => (
          <div key={q.question}>
            <dt>{q.question}</dt>
            <dd>
              {q.answer}
              {q.href ? (
                <>
                  {" "}
                  <a
                    className="textlink"
                    href={q.href}
                    {...(q.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {q.hrefLabel} ↗
                  </a>
                </>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
