import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { AboutSection } from "@/components/landing/about-section"
import { ServicesSection } from "@/components/landing/services-section"
import { AutomationSection } from "@/components/landing/automation-section"
import { ProjectsSection } from "@/components/landing/projects-section"
import { ContactSection } from "@/components/landing/contact-section"
import { Footer } from "@/components/landing/footer"
import { getSiteContent, getPublicAutomations, getSiteStats } from "@/lib/content"

// Se actualiza sola cada minuto (y al instante cuando guardas cambios en el panel)
export const revalidate = 60

export default async function HomePage() {
  const [content, cases, stats] = await Promise.all([getSiteContent(), getPublicAutomations(), getSiteStats()])

  return (
    <div id="inicio" className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection content={content} stats={stats} />
        <AboutSection />
        <ServicesSection />
        <AutomationSection content={content} cases={cases} />
        <ProjectsSection />
        <ContactSection content={content} />
      </main>
      <Footer content={content} />
    </div>
  )
}
