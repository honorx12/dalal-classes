import { Parallax } from '../../lib/motion'

/**
 * Layered hero backdrop: radial brand mesh + fading grid + parallax blobs + noise.
 * Absolutely positioned; parent needs `relative`.
 */
export default function HeroBackdrop({ withGrid = true }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-hero" />
      {withGrid && <div className="absolute inset-0 grid-bg" />}
      <Parallax speed={0.3} className="absolute -top-24 -left-24 w-96 h-96">
        <div className="w-full h-full rounded-full bg-brand/20 blur-[100px] animate-float-slow" />
      </Parallax>
      <Parallax speed={0.5} className="absolute top-1/3 -right-24 w-80 h-80">
        <div className="w-full h-full rounded-full bg-accent-cyan/15 blur-[100px] animate-float-slow" />
      </Parallax>
      <div className="noise-overlay" />
    </div>
  )
}
