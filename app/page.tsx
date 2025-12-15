import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { TrustedDestinations } from "@/components/trusted-destinations"
import { StrategicRoadmap } from "@/components/strategic-roadmap"
import { PrivateOfficeProtocol } from "@/components/private-office-protocol"
import { ClinicalPhilosophy } from "@/components/clinical-philosophy"
import { ClinicalBoard } from "@/components/clinical-board"
import { DirectorsStatement } from "@/components/directors-statement"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ClinicalInterventions } from "@/components/clinical-interventions"
import { AdvantageSection } from "@/components/advantage-section"
import { AdmissionsIntelligence } from "@/components/admissions-intelligence"
import { CandidacyQueries } from "@/components/candidacy-queries"
import { CTASection } from "@/components/cta-section"
import { InternationalStrategy } from "@/components/international-strategy"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <TrustedDestinations />
        <StrategicRoadmap />
        <PrivateOfficeProtocol />
        <ClinicalPhilosophy />
        <ClinicalBoard />
        <DirectorsStatement />
        <TestimonialsSection />
        <ClinicalInterventions />
        <AdvantageSection />
        <AdmissionsIntelligence />
        <CandidacyQueries />
        <CTASection />
        <InternationalStrategy />
      </main>
      <Footer />
    </>
  )
}
