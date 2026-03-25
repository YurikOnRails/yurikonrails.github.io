export interface Build {
  title: string
  description: string
  url: string
  icon: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  kind: 'business' | 'oss' | 'media' | 'community'
  position: number
  startedOn: string
  finishedOn?: string
  cover?: string
}

export const builds: Build[] = [
  {
    title: 'Fieldnotes',
    description: 'Personal publishing platform. Essays, travel photography, project documentation. Built with Astro 6 and a cinematic dark aesthetic.',
    url: 'https://yurikonrails.github.io',
    icon: 'arrow-right',
    status: 'active',
    kind: 'oss',
    position: 1,
    startedOn: '2026-03-01',
  },
]
