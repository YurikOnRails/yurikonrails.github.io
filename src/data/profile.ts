export interface Profile {
  name: string
  bio: string
  avatar: string
  location: string
  email?: string
  social: {
    github?: string
    twitter?: string
    telegram?: string
  }
}

export const profile: Profile = {
  name: 'Yuri Konrails',
  bio: 'Building software, writing essays, photographing the world. Interested in systems, craft, and the spaces between.',
  avatar: '/avatar.avif',
  location: 'Moscow, Russia',
  social: {
    github: 'https://github.com/yurikonrails',
    telegram: 'https://t.me/yurikonrails',
  },
}
