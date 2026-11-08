import { Facebook, Instagram } from "lucide-react"
import type { SiteContent } from "@/lib/content"

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.4-2.47V9.67a5.7 5.7 0 0 0-.8-.05A5.69 5.69 0 0 0 4.16 15.3 5.69 5.69 0 0 0 9.85 21a5.69 5.69 0 0 0 5.69-5.69V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48Z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  )
}

export function getSocialLinks(content: SiteContent) {
  return [
    { label: "Instagram", href: content.instagramUrl, Icon: Instagram },
    { label: "Facebook", href: content.facebookUrl, Icon: Facebook },
    { label: "TikTok", href: content.tiktokUrl, Icon: TikTokIcon },
    { label: "X", href: content.xUrl, Icon: XIcon },
  ].filter((s) => s.href)
}

export function SocialLinks({ content, variant = "dark" }: { content: SiteContent; variant?: "dark" | "light" }) {
  const links = getSocialLinks(content)
  if (links.length === 0) return null
  return (
    <div className="flex gap-3">
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={
            variant === "dark"
              ? "flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 transition-all hover:-translate-y-0.5 hover:bg-cyan-500 hover:text-white"
              : "flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-600"
          }
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  )
}
