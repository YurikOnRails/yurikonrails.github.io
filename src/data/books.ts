export interface Book {
  title: string
  author: string
  cover: string
  yearRead: number
  rating: 1 | 2 | 3 | 4 | 5
  keyIdea: string
  review?: string
  status: 'reading' | 'finished' | 'dropped'
  tags?: string[]
}

export const books: Book[] = [
  {
    title: 'Seeing Like a State',
    author: 'James C. Scott',
    cover: 'seeing-like-a-state',
    yearRead: 2026,
    rating: 5,
    keyIdea: 'Centralized planning fails when it ignores local, practical knowledge.',
    status: 'reading',
    tags: ['politics', 'systems'],
  },
]
