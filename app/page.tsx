import EarningsTracker from "@/components/earnings-tracker"
import UserSelector from "@/components/user-selector"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <div className="mb-6 md:mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 text-balance">Earnings & Sprints</h1>
              <p className="text-sm md:text-base text-muted-foreground text-balance">
                Track your weekly earnings and execute focused 15-day sprints
              </p>
            </div>
            <UserSelector />
          </div>
        </div>
        <EarningsTracker />
      </div>
    </main>
  )
}
