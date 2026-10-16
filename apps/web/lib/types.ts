export type Movie = { id: string; title: string; year: number; genres: string[]; duration: number; rating?: number; description: string; poster: string; videoUrl: string; accent: string };
export type Participant = { id: string; name: string; joinedAt: number; isHost: boolean; lastSeen: number };
export type Playback = { movieId: string; playing: boolean; position: number; updatedAt: number; revision: number; movie: Movie };
export type Message = { id: string; participantId: string; name: string; body: string; createdAt: number };
export type Poll = { id: string; question: string; options: { id: string; label: string }[]; createdBy: string; createdAt: number; closed: boolean };
export type Room = { code: string; name: string; hostId: string; isHost: boolean; createdAt: number; capacity: number; participants: Participant[]; playback: Playback; playlist: Movie[]; messages: Message[]; reactions: { id: string; participantId: string; emoji: string; createdAt: number }[]; polls: Poll[]; pollVotes: Record<string, Record<string, string>>; eventSequence: number };
