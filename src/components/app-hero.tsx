'use client'
import { useRouter } from 'next/navigation'

export function AppHero() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/module1/onboard')
  }

  return (
    <section className="flex flex-col lg:flex-row items-center justify-center min-h-screen px-6 py-12 bg-white">
      {/* Left column */}
      <div className="flex-1 max-w-2xl mb-8 lg:mb-0 lg:mr-12">
        <h1 className="text-4xl lg:text-6xl font-bold text-tigerGreen mb-6 leading-tight">
          Build Trust, Access Capital, Grow Your Future.
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Unlock collateral-free micro-lending powered by your on-chain reputation 
          and AI-driven trust assessment.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleGetStarted}
            className="bg-tigerGreen text-white px-8 py-4 text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Get Started
          </button>
          
          <button className="bg-white text-tigerGreen border-2 border-tigerGreen px-8 py-4 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            Learn More
          </button>
        </div>
      </div>
      
      {/* Right column */}
      <div className="flex-1 max-w-md">
        <img
          src="/images/crypto-wallet-illustration.png"
          alt="Crypto wallet and phone illustration"
          className="rounded-lg w-full h-auto max-w-[500px] max-h-[400px]"
        />
      </div>
    </section>
  )
}
