import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#0A0A0F',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <div
          style={{
            alignItems: 'center',
            background: 'linear-gradient(135deg, #06B6D4 0%, #7C3AED 54%, #EC4899 100%)',
            borderRadius: 42,
            boxShadow: '0 24px 80px rgba(6,182,212,0.36)',
            color: '#FFFFFF',
            display: 'flex',
            fontSize: 58,
            fontWeight: 800,
            height: 132,
            justifyContent: 'center',
            letterSpacing: -2,
            width: 132
          }}
        >
          AK
        </div>
      </div>
    ),
    size
  )
}
