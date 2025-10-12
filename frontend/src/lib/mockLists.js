export const mockLists = (movie) => ([
  {
    id: 'list1',
    title: 'The Conjuring Collection',
    description:
      'A supernatural horror film series that follows Ed and Lorraine Warren investigating haunting cases.',
    posters: [movie.backdrop_path, '/inception.jpg', '/interstellar.jpg'],
    stats: { score: 67, lists: 488, likes: 5054, comments: 6 },
  },
  {
    id: 'list2',
    title: 'Latest Releases',
    description: 'New and trending theatrical releases this month.',
    posters: ['/the-dark-knight.jpg', '/the-prestige.jpg', movie.backdrop_path],
    stats: { score: 72, lists: 381, likes: 2033, comments: 4 },
  },
]);
