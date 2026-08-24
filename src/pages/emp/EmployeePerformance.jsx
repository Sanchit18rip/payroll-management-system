import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import useEmployeeData from './useEmployeeData'
import { styles, colors, radius } from './theme'
import { Star, Trophy, BarChart3, TrendingUp } from 'lucide-react'

function EmployeePerformance() {
  const { loading, errorMsg, performance } = useEmployeeData()

  if (loading) return <div style={styles.centerScreen}><div style={{ color: colors.text.secondary }}>Loading...</div></div>
  if (errorMsg) return <div style={styles.centerScreen}><div style={{ ...styles.sectionCard, maxWidth: 440, textAlign: 'center' }}><h2 style={{ color: colors.text.primary }}>Error</h2><p style={{ color: colors.text.secondary }}>{errorMsg}</p></div></div>

  const chartData = performance.slice().reverse().map((p, i) => ({ review: `#${i + 1}`, rating: Number(p.rating) }))
  const avg = performance.length > 0 ? (performance.reduce((s, p) => s + Number(p.rating), 0) / performance.length).toFixed(1) : 0
  const best = performance.length > 0 ? Math.max(...performance.map(p => Number(p.rating))) : 0
  const latest = performance.length > 0 ? Number(performance[0].rating) : 0

  return (
    <div style={styles.pageContainer}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.pageTitle}>My Performance</h1>
        <p style={styles.pageSubtitle}>Track your performance reviews and ratings over time</p>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        {[
          [Star, 'Average Rating', avg, '#f59e0b'],
          [Trophy, 'Best Rating', best, '#22c55e'],
          [BarChart3, 'Total Reviews', performance.length, '#06b6d4'],
          [TrendingUp, 'Latest Rating', latest, '#a855f7'],
        ].map(([Icon, label, val, c], i) => (
          <div key={label} style={{ ...styles.miniCard, borderLeft: `3px solid ${c}`, animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}>
            <Icon size={18} color={c} />
            <p style={{ color: colors.text.muted, fontSize: 11, textTransform: 'uppercase', margin: '6px 0 2px', fontWeight: 500 }}>{label}</p>
            <p style={{ color: c, fontSize: 28, fontWeight: 700, margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      <div style={styles.twoCol}>
        <div style={styles.col()}>
          {/* Chart */}
          {performance.length > 0 && (
            <div style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Rating Trend</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="review" stroke={colors.text.muted} fontSize={12} />
                  <YAxis domain={[0, 5]} stroke={colors.text.muted} fontSize={12} />
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: radius.sm, fontSize: 13 }} />
                  <Bar dataKey="rating" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={styles.col('1 1 420px')}>
          <div style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>Performance Reviews</h2>
            {performance.length === 0 ? (
              <p style={{ color: colors.text.muted, textAlign: 'center', padding: 20 }}>No reviews yet.</p>
            ) : (
              performance.map(p => (
                <div key={p.id} style={{ background: 'rgba(2,6,23,0.4)', border: colors.border.subtle, borderRadius: radius.md, padding: 14, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 4 }}>{p.rating} <Star size={14} color="#f59e0b" fill="#f59e0b" /></span>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <div key={s} style={{ width: 16, height: 4, borderRadius: 2, background: s <= Number(p.rating) ? '#f59e0b' : 'rgba(148,163,184,0.15)' }} />
                        ))}
                      </div>
                    </div>
                    <span style={{ color: colors.text.muted, fontSize: 11 }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : ''}</span>
                  </div>
                  <p style={{ color: colors.text.secondary, fontSize: 13, margin: '8px 0 0', lineHeight: 1.5 }}>{p.feedback}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeePerformance
