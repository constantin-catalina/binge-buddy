export const mockPeopleWatchingNow = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  avatar: `https://i.pravatar.cc/64?img=${i + 1}`,
}));
