/** Ribbon Modernism: the folded Rinova Pink mark must remain a confident, tactile navigation anchor. */
import { cloudflareAssets } from "@/lib/cloudflare-assets";
type BrandMarkProps = {
  compact?: boolean;
  tone?: "pink" | "ink";
};

export function BrandMark({ compact = false, tone = "pink" }: BrandMarkProps) {
  return (
    <a className="brand-lockup" href="/" aria-label="Rinovabd home">
      <img
        className={`brand-mark brand-mark--${tone}`}
        src={cloudflareAssets.ribbonLoopSymbol}
        alt=""
      />
      {!compact && <span className="brand-wordmark"><b>rinova</b><i>bd</i></span>}
    </a>
  );
}
