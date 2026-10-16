import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon, label, value, trend, trendUp, accentColor, iconBg }) {
  return (
    <div className="stat-card" style={{ '--card-accent': accentColor }}>
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ background: iconBg }}>
          {icon}
        </div>
        <div
          className="stat-card-trend"
          style={{
            background: trendUp ? '#f0fdf4' : '#fef2f2',
            color: trendUp ? '#15803d' : '#b91c1c',
          }}
        >
          {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {trend}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
