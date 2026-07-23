import { TrendingUp, BarChart3, LineChart, CandlestickChart, PieChart, Landmark, Wallet } from 'lucide-react'
import { Marquee } from '../../lib/motion'

const ITEMS = [
  { icon: TrendingUp, label: 'Technical Analysis' },
  { icon: CandlestickChart, label: 'Price Action' },
  { icon: BarChart3, label: 'Market Structure' },
  { icon: LineChart, label: 'Swing Trading' },
  { icon: PieChart, label: 'Portfolio Building' },
  { icon: Landmark, label: 'Fundamentals' },
  { icon: Wallet, label: 'Risk Management' },
]

/**
 * Social-proof strip: marquee of curriculum/topic marks in monochrome,
 * brand color on hover.
 */
export default function LogoMarquee({ heading = 'Everything the markets demand — in one curriculum' }) {
  return (
    <div className="py-10">
      <p className="text-center text-sm text-content-muted mb-6">{heading}</p>
      <Marquee>
        {ITEMS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 text-content-muted hover:text-brand transition-colors duration-300 select-none"
          >
            <Icon className="w-5 h-5" strokeWidth={1.75} />
            <span className="text-sm font-medium whitespace-nowrap">{label}</span>
          </div>
        ))}
      </Marquee>
    </div>
  )
}
