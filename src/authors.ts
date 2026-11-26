export const authors = [
  "baranwang",
  "fatwang2",
  "0tt0",
  "JasonChou0v0",
  "zxfccmm4",
  "thedavidweng",
  "bluenight91",
  "catoncat",
  "miantiao-me",
].map((name) => ({
  name,
  file: `${name}.webp`,
  url: `https://unavatar.webp.se/github/${name}`,
}));

const authorsByName = new Map(authors.map((author) => [author.name, author]));

export function avatarPath(name: string): string | undefined {
  const author = authorsByName.get(name);
  return author ? `/avatars/${author.file}` : undefined;
}
