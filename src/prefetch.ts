export function isPagePath(path: string) {
  return /^\/(?:[a-z]{2}(?:-[A-Z]{2})?(?:\/|$))?(?:dashboards\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(
    path,
  );
}

export function createPrefetcher(currentURL: string, send: (url: string) => void) {
  const current = new URL(currentURL);
  current.hash = "";
  const targets = new Set<string>();

  return (href: string) => {
    if (targets.size >= 3) return;
    let target: URL;
    try {
      target = new URL(href, current);
    } catch {
      return;
    }
    target.hash = "";
    if (
      target.origin !== current.origin ||
      target.search ||
      !isPagePath(target.pathname) ||
      target.href === current.href ||
      targets.has(target.href)
    )
      return;
    targets.add(target.href);
    send(target.href);
  };
}
