import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Engineering Insights'
  const category = searchParams.get('category') || 'Backend Systems'

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'stretch',
          background: '#0A0A0F',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
          padding: 72,
          width: '100%'
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.34), rgba(124,58,237,0.28), rgba(236,72,153,0.24))',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 36,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            justifyContent: 'space-between',
            padding: 56
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, letterSpacing: 6, textTransform: 'uppercase' }}>
            <span>{category}</span>
            <span>Amit Kumar Singh</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 30 }}>Backend Engineering / Distributed Systems / System Design</div>
            <div style={{ fontSize: 70, fontWeight: 700, lineHeight: 1.05, maxWidth: 950 }}>{title}</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  )
}
