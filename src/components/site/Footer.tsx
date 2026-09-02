const GROUPS = [
  { label: "Product", href: "#downloader" },
  { label: "Supported platforms", href: "#platforms" },
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
  { label: "GitHub", href: "https://github.com" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface-sunken">
      <div className="shell flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[14px] font-medium">
          <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-text text-[10px] font-semibold text-surface">
            C
          </span>
          Conduit
          <span className="mono-meta ml-2 text-text-muted">v0.4.0</span>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {GROUPS.map((g) => (
              <li key={g.label}>
                <a
                  href={g.href}
                  className="text-[13px] text-text-secondary transition-colors duration-150 hover:text-text"
                >
                  {g.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="shell border-t border-border py-4">
        <p className="text-[12px] text-text-muted">
          Conduit retrieves publicly accessible media only. Respect the rights of the original creators.
        </p>
      </div>
    </footer>
  );
}
