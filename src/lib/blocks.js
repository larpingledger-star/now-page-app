export const BLOCK_TYPES = [
  { type: "text", label: "Text", description: "A paragraph. Supports **bold**, *italics*, and [links](url)." },
  { type: "heading", label: "Heading", description: "A sub-heading within the section." },
  { type: "image", label: "Image", description: "An image with an optional caption." },
  { type: "link", label: "Link", description: "A titled link with a short description." },
  { type: "list", label: "List", description: "A bulleted list of items." },
  { type: "quote", label: "Quote", description: "A blockquote with optional attribution." },
  { type: "embed", label: "Embed", description: "An embedded video (YouTube, Vimeo, etc.)." },
  { type: "music", label: "Music", description: "An MP3 player with cover art, title, and artist." },
];

export function createBlock(type) {
  switch (type) {
    case "text":
      return { type, content: "" };
    case "heading":
      return { type, content: "" };
    case "image":
      return { type, url: "", caption: "", width: "normal" };
    case "link":
      return { type, label: "", url: "", description: "" };
    case "list":
      return { type, items: [""] };
    case "quote":
      return { type, content: "", attribution: "" };
    case "embed":
      return { type, url: "", caption: "" };
    case "music":
      return { type, title: "", artist: "", audio_url: "", cover_url: "" };
    default:
      return { type: "text", content: "" };
  }
}

export function normalizeEmbedUrl(url) {
  if (!url) return "";
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}