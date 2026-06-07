"use client"

import { useEffect, useState } from 'react'

export function useCurrentYear(fallbackYear = '2026') {
  const [year, setYear] = useState(fallbackYear)

  useEffect(() => {
    setYear(String(new Date().getFullYear()))
  }, [])

  return year
}
