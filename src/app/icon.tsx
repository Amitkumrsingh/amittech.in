import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #06B6D4 0%, #7C3AED 54%, #EC4899 100%)',
          borderRadius: 8,
          color: '#FFFFFF',
          display: 'flex',
          fontSize: 12,
          fontWeight: 800,
          height: '100%',
          justifyContent: 'center',
          letterSpacing: -0.2,
          width: '100%'
        }}
      >
        AK
      </div>
    ),
    size
  )
}
