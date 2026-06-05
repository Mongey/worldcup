interface Props {
  fetchedAt: number | null;
}

// A bald-eagle-screech of a header: bunting on top and bottom, a navy
// star-field canton, an eagle silhouette, and the title set in heavy slab
// VARSITY type with a propaganda-poster red drop shadow.
export function Header({ fetchedAt }: Props) {
  const updated = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  return (
    <header className="relative">
      {/* Top bunting strip */}
      <div aria-hidden className="h-3 sm:h-4 bunting" />

      <div className="relative bg-usa-cream dark:bg-usa-navy-night border-y-4 border-usa-red">
        {/* Navy star-field canton on the left, visible on wider viewports */}
        <div
          aria-hidden
          className="hidden sm:block absolute left-0 top-0 bottom-0 w-24 star-field"
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-28 py-4 sm:py-5 flex items-center justify-center gap-4">
          <span aria-hidden className="text-3xl sm:text-5xl leading-none select-none -scale-x-100">
            🦅
          </span>

          <div className="flex-1 min-w-0 text-center">
            <div className="font-stencil text-[10px] sm:text-xs uppercase tracking-huge text-usa-red dark:text-usa-gold leading-none mb-1">
              ★ ★ ★ &nbsp; EST. 1776 &nbsp; ★ ★ ★
            </div>
            <h1 className="font-display text-3xl sm:text-5xl leading-[0.9] tracking-tight uppercase">
              <span className="text-usa-navy dark:text-usa-cream poster-shadow-light sm:poster-shadow">
                World Cup
              </span>{" "}
              <span className="text-usa-red poster-shadow-navy-light sm:poster-shadow-navy">
                2026
              </span>
            </h1>
            <div className="font-stencil text-[10px] sm:text-xs uppercase tracking-huge text-usa-navy/70 dark:text-usa-cream/70 leading-none mt-1.5">
              USA · CAN · MEX · MMXXVI
            </div>
          </div>

          <span aria-hidden className="text-3xl sm:text-5xl leading-none select-none">
            🦅
          </span>
        </div>

        {/* Live-data clock badge — bolted onto the bottom-right of the header */}
        {updated && (
          <div className="absolute bottom-1 right-2 sm:right-4 font-stencil text-[10px] tab-num text-usa-navy/60 dark:text-usa-cream/60 uppercase tracking-wider">
            ⟢ {updated} ZULU
          </div>
        )}
      </div>

      {/* Bottom bunting strip */}
      <div aria-hidden className="h-3 sm:h-4 bunting" />
    </header>
  );
}

