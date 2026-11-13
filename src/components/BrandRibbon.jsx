export default function BrandRibbon() {
  return (
    <div className="brand-ribbon" aria-hidden="true">
      <svg viewBox="0 0 1440 110" preserveAspectRatio="none">
        <path className="ribbon-blue" d="M0 18 H1260 Q1290 18 1290 0" />
        <path className="ribbon-magenta" d="M540 48 H85 Q30 48 30 70 Q30 92 85 92 H1110" />
        <path className="ribbon-orange" d="M460 40 H1440" />
        <path className="ribbon-green" d="M730 68 H1440" />
      </svg>
      <img src="/ged-logo.png" alt="" width="37" height="54" />
    </div>
  );
}
