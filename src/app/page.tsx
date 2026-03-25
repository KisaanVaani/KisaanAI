import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import HowItWorks from '@/components/sections/HowItWorks'
import DataSources from '@/components/sections/DataSources'
import TechStack from '@/components/sections/TechStack'
import PhoneSimulator from '@/components/sections/PhoneSimulator'
import LiveAgent from '@/components/sections/LiveAgent'
import ImpactMetrics from '@/components/sections/ImpactMetrics'
import CallToAction from '@/components/sections/CallToAction'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <DataSources />
      <TechStack />
      <PhoneSimulator />
      <LiveAgent />
      <ImpactMetrics />
      <CallToAction />
      <Footer />
    </main>
  )
}
