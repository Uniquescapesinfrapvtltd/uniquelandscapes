import ScrollCarousel from '@/components/ScrollCarousel'
import { SERVICES, SERVICE_CARD_PHOTOS, SERVICE_PAGES, SERVICE_SLUGS } from '@/data/content'

const N = SERVICES.length
const items = SERVICES.map(([title, body, , phs], i) => ({
  num: String(i + 1).padStart(2, '0') + ' / 0' + N, title, body, slot: 'svc-' + (i + 1), placeholder: phs[0], src: SERVICE_CARD_PHOTOS[SERVICE_SLUGS[i]],
  // Every service with a stage-by-stage page is clickable (card and title).
  href: SERVICE_PAGES[SERVICE_SLUGS[i]] ? '?service=' + SERVICE_SLUGS[i] : undefined,
}))

interface Props { isMobile: boolean; reduced: boolean; onOpen: (href: string) => void }

export default function Services({ isMobile, reduced, onOpen }: Props) {
  return (
    <ScrollCarousel id="services" screenLabel="Services" label="Services" count={'0' + N + ' disciplines'} staticCount={'0' + N}
      items={items} isMobile={isMobile} reduced={reduced} onOpen={onOpen} />
  )
}
