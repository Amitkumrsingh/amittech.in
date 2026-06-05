const motionTheme = {
  duration: {
    short: 0.18,
    base: 0.35,
    long: 0.7
  },
  ease: {
    inOut: 'easeInOut',
    out: 'easeOut',
    linear: 'linear'
  },
  variants: {
    fadeUp: (delay = 0) => ({ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { delay, duration: 0.35, ease: 'easeOut' } } }),
    containerStagger: (stagger = 0.06) => ({ hidden: {}, show: { transition: { staggerChildren: stagger } } })
  }
}

export default motionTheme
