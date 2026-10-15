import ScrollCarousel from '@/components/ScrollCarousel'
import DesignGallery from '@/components/DesignGallery'
import type { ServicePageContent } from '@/data/content'

interface Props { slug: string; page: ServicePageContent; isMobile: boolean; reduced: boolean; onBack: () => void }

/** "<Service> · Stage by stage" — the page a service card opens. Same carousel as the home Services section. */
export default function ServicePage({ slug, page, isMobile, reduced, onBack }: Props) {
  const N = page.stages.length
  const items = page.stages.map(([tag, title, body, placeholder, photo], i) => ({
    num: tag + ' · ' + String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0'),
    title, body, placeholder, src: photo, slot: slug + '-stage-' + (i + 1),
  }))
  return (
    <>
    <ScrollCarousel id="stages" screenLabel={page.name + ' — stage by stage'} label={page.name + ' · Stage by stage'}
      count={String(N).padStart(2, '0') + ' stages'} staticCount={String(N).padStart(2, '0')}
      items={items} isMobile={isMobile} reduced={reduced} onBack={onBack} />
    {/* Up to dozens of finished designs per service: grid + full-screen viewer, fed by src/assets/designs/<slug>/. */}
    <DesignGallery slug={slug} name={page.name} />
    </>
  )
}
