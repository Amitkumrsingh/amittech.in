import dynamic from 'next/dynamic'
import Hero from '../components/Hero'
import PageTransition from '../components/PageTransition'

const InteractiveArea = dynamic(() => import('../components/InteractiveArea'), { ssr: false })

export default function Page() {
  return (
    <PageTransition>
      <main className="px-4 sm:px-6 pb-8 pt-24 sm:pb-12 sm:pt-28 max-w-6xl mx-auto">
        <Hero />
        <InteractiveArea />
      </main>
    </PageTransition>
  )
}
