/** Ribbon Modernism: the folded Rinova Pink mark must remain a confident, tactile navigation anchor. */
type BrandMarkProps = {
  compact?: boolean;
  tone?: "pink" | "ink";
};

export function BrandMark({ compact = false, tone = "pink" }: BrandMarkProps) {
  return (
    <a className="brand-lockup" href="/" aria-label="Rinovabd home">
      <img
        className={`brand-mark brand-mark--${tone}`}
        src="/manus-storage/rinovabd-ribbon-loop-symbol_75291c2e.png"
        alt=""
      />
      {!compact && <span className="brand-wordmark"><b>rinova</b><i>bd</i></span>}
    </a>
  );
}
