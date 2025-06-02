import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative px-8 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Fashion Forward</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Discover the latest trends in premium clothing and accessories
        </p>
        <Button size="lg" variant="secondary">
          Shop Now
        </Button>
      </div>
    </section>
  )
}
