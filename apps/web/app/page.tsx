
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Compass,
  Film,
  Headphones,
  Link2,
  Menu,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Waves,
  X,
} from 'lucide-react';

import MovieCard from '../components/MovieCard';
import { emitAck } from '../lib/socket';
import type { Movie, Room } from '../lib/types';

const API =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

export default function HomePage() {
  const router = useRouter();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | undefined>();

  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('recommended');

  const [modal, setModal] = useState<'create' | 'join' | null>(null);
  const [name, setName] = useState('');
  const [roomName, setRoomName] = useState('Friday Night Cinema');
  const [roomCode, setRoomCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch(`${API}/api/catalog`)
      .then((response) => {
        if (!response.ok) throw new Error('Catalogue request failed');
        return response.json();
      })
      .then((data) => {
        setMovies(data.items || []);
        setGenres(data.genres || []);
      })
      .catch(() => {
        setError(
          'Could not connect to the WatchWave server. Start the backend and refresh.'
        );
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ q: query, genre, sort });

      fetch(`${API}/api/catalog?${params}`)
        .then((response) => {
          if (!response.ok) throw new Error('Catalogue request failed');
          return response.json();
        })
        .then((data) => setMovies(data.items || []))
        .catch(() => {});
    }, 180);

    return () => clearTimeout(timer);
  }, [query, genre, sort]);

  const featured = useMemo(
    () => movies.find((movie) => movie.id === 'big-buck-bunny') || movies[0],
    [movies]
  );

  function openCreateModal(movie?: Movie) {
    setSelectedMovie(movie);
    setError('');

    if (movie) {
      setRoomName(`Movie night: ${movie.title}`);
    }

    setModal('create');
  }

  async function createRoom() {
    setBusy(true);
    setError('');

    try {
      const room = await emitAck<Room>('room:create', {
        name: roomName,
        hostName: name.trim() || 'Alex',
        movieId: selectedMovie?.id || featured?.id,
      });

      router.push(
        `/room/${room.code}?name=${encodeURIComponent(name.trim() || 'Alex')}`
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not create room.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    setBusy(true);
    setError('');

    try {
      const code = roomCode.trim().toUpperCase();

      if (!code) {
        throw new Error('Enter a room code.');
      }

      await emitAck<Room>('room:join', {
        code,
        name: name.trim() || 'Guest',
      });

      router.push(
        `/room/${code}?name=${encodeURIComponent(name.trim() || 'Guest')}&joined=1`
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not join room.'
      );
    } finally {
      setBusy(false);
    }
  }

  function addMovie(movie: Movie) {
    setToast(`${movie.title} is ready to add to a party playlist.`);
    setSelectedMovie(movie);
    setRoomName(`Movie night: ${movie.title}`);
    setError('');
    setModal('create');
  }

  return (
    <main className="home-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark"><Waves size={21} /></span>
          <span>watchwave<span className="brand-period">.</span></span>
        </a>

        <nav className="main-nav">
          <a className="active" href="#discover">Discover</a>
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
        </nav>

        <div className="top-actions">
          <button
            className="button button-quiet top-join"
            onClick={() => {
              setError('');
              setModal('join');
            }}
          >
            <Link2 size={15} /> Join a room
          </button>

          <button
            className="button button-primary"
            onClick={() => openCreateModal()}
          >
            <Plus size={16} /> Create party
          </button>
        </div>

        <button className="icon-button mobile-menu" aria-label="Open menu">
          <Menu />
        </button>
      </header>

      <section className="hero">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />

        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> YOUR PEOPLE. YOUR MOVIE NIGHT.
          </div>

          <h1>
            Good movies.
            <br />
            Better <span className="gradient-word">together.</span>
          </h1>

          <p className="hero-description">
            Press play at the same time, from anywhere. Your next
            unforgettable movie night is just a room away.
          </p>

          <div className="hero-actions">
            <button
              className="button button-primary button-large"
              onClick={() => openCreateModal()}
            >
              Start a watch party <ArrowRight size={17} />
            </button>

            <button
              className="button button-outline button-large"
              onClick={() => {
                setError('');
                setModal('join');
              }}
            >
              <Link2 size={16} /> Join with a code
            </button>
          </div>

          <div className="social-proof">
            <div className="avatar-stack">
              <span>A</span><span>M</span><span>J</span><span>+</span>
            </div>
            <div>
              <strong>Your crew, in sync.</strong>
              <small>Every laugh lands together.</small>
            </div>
            <span className="proof-separator" />
            <div className="proof-stat">
              <strong>250ms</strong>
              <small>sync target</small>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-glow" />

          <div className="cinema-window">
            <div className="window-top">
              <span className="window-dots"><i /><i /><i /></span>
              <span className="window-title">
                <span className="live-dot" /> LIVE WATCH PARTY
              </span>
              <span className="window-menu">•••</span>
            </div>

            <div
              className="cinema-screen"
              style={{
                backgroundImage: `linear-gradient(180deg,rgba(10,12,23,.05),rgba(10,12,23,.6)),url('${featured?.poster || ''}')`,
              }}
            >
              <div className="screen-badge">
                <span className="live-dot" /> IN SYNC
              </div>

              <div className="screen-copy">
                <span>TONIGHT'S FEATURE</span>
                <h2>{featured?.title || 'Big Buck Bunny'}</h2>
                <p>Adventure · Animation · 2008</p>
              </div>

              <button
                className="big-play"
                onClick={() => openCreateModal()}
                aria-label="Start a watch party"
              >
                <Play size={24} fill="currentColor" />
              </button>

              <div className="screen-progress"><span /></div>
            </div>

            <div className="window-footer">
              <div className="watching-avatars">
                <span>J</span><span>M</span><span>A</span><span>S</span>
              </div>
              <span className="watching-label">4 friends watching</span>
              <div className="mini-reactions">
                <span>😂</span><span>❤️</span><span>🔥</span>
              </div>
            </div>
          </div>

          <div className="float-card sync-card">
            <span className="float-icon green"><Check size={15} /></span>
            <div>
              <strong>Everyone in sync</strong>
              <small>Drift corrected · 42ms</small>
            </div>
          </div>

          <div className="float-card chat-card">
            <span className="chat-avatar">M</span>
            <div>
              <small>Maya · just now</small>
              <strong>THE PLOT TWIST 😭</strong>
            </div>
            <span className="chat-emoji">💀</span>
          </div>

          <div className="decorative-star star-one">✳</div>
          <div className="decorative-star star-two">✦</div>
        </div>

        <div className="hero-bottom">
          <span><ShieldCheck size={15} /> Private rooms</span>
          <span><Headphones size={15} /> Low-latency sync</span>
          <span><Users size={15} /> Built for your crew</span>
          <span className="scroll-cue">
            SCROLL TO EXPLORE <ChevronDown size={14} />
          </span>
        </div>
      </section>

      <section className="discovery-section" id="discover">
        <div className="section-heading">
          <div>
            <div className="eyebrow muted-eyebrow">
              <Compass size={14} /> THE WATCHLIST
            </div>
            <h2>
              Find your next <span className="gradient-word">favourite.</span>
            </h2>
            <p>Good stories are even better when they're shared.</p>
          </div>

          <div className="discovery-count">
            <span>{movies.length.toString().padStart(2, '0')}</span> titles to explore
          </div>
        </div>

        <div className="catalog-toolbar">
          <label className="search-field">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, genres, moods..."
            />
            <kbd>⌘ K</kbd>
          </label>

          <div className="filter-row">
            <div className="genre-pills">
              <button
                className={genre === 'All' ? 'selected' : ''}
                onClick={() => setGenre('All')}
              >
                All picks
              </button>

              {genres.slice(0, 5).map((g) => (
                <button
                  key={g}
                  className={genre === g ? 'selected' : ''}
                  onClick={() => setGenre(g)}
                >
                  {g}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort movies"
            >
              <option value="recommended">For your crew</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onWatch={(selected) => openCreateModal(selected)}
              onAdd={addMovie}
            />
          ))}
        </div>

        {movies.length === 0 && (
          <div className="empty-state">
            <Film size={26} />
            <h3>No movies found</h3>
            <p>Try another title or loosen your filters.</p>
            <button
              className="button button-outline"
              onClick={() => {
                setQuery('');
                setGenre('All');
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <section className="feature-strip" id="features">
        <div className="feature-intro">
          <div className="eyebrow">
            <Sparkles size={14} /> NOT JUST A PLAYER
          </div>
          <h2>
            A little more
            <br />
            movie <span className="gradient-word">magic.</span>
          </h2>
          <p>All the little things that turn watching into a memory.</p>
        </div>

        <div className="feature-item">
          <span className="feature-icon purple"><Waves size={21} /></span>
          <h3>Perfectly in sync</h3>
          <p>Play, pause and seek together. Drift correction keeps every moment aligned.</p>
          <span className="feature-number">01 / SYNC</span>
        </div>

        <div className="feature-item">
          <span className="feature-icon coral"><span>😂</span></span>
          <h3>Feel the room</h3>
          <p>React in real time, send a message, and laugh at the same moment.</p>
          <span className="feature-number">02 / REACT</span>
        </div>

        <div className="feature-item">
          <span className="feature-icon blue"><Users size={21} /></span>
          <h3>Decide together</h3>
          <p>Build a shared playlist and vote on what makes the final cut.</p>
          <span className="feature-number">03 / DISCOVER</span>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="eyebrow muted-eyebrow">
          THREE STEPS. ONE GREAT NIGHT.
        </div>
        <h2>
          It's your couch, <span className="gradient-word">reimagined.</span>
        </h2>

        <div className="steps">
          <div>
            <span>01</span>
            <h3>Make a room</h3>
            <p>Give your movie night a name and create a private invite.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Bring your people</h3>
            <p>Share one short code. Friends can join from their own devices.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Hit play together</h3>
            <p>Pick a film, react to the good bits, and make it a night.</p>
          </div>
        </div>

        <button
          className="button button-primary button-large"
          onClick={() => openCreateModal()}
        >
          Make tonight a movie night <ArrowRight size={17} />
        </button>
      </section>

      <footer className="footer">
        <a className="brand" href="/">
          <span className="brand-mark"><Waves size={19} /></span>
          <span>watchwave<span className="brand-period">.</span></span>
        </a>
        <span>Made for the moments between the scenes.</span>
        <span>© 2026 WATCHWAVE</span>
      </footer>

      {toast && (
        <div className="toast" onClick={() => setToast('')}>
          {toast}
          <button aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close icon-button"
              onClick={() => setModal(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="modal-mark"><Waves size={23} /></div>

            <div className="eyebrow muted-eyebrow">
              {modal === 'create'
                ? 'YOUR PRIVATE CINEMA'
                : 'YOUR FRIENDS ARE WAITING'}
            </div>

            <h2>{modal === 'create' ? 'Set the scene.' : 'Jump right in.'}</h2>

            <p>
              {modal === 'create'
                ? `Give your room a name${selectedMovie ? ` for ${selectedMovie.title}` : ''}, invite your people, and let the good times roll.`
                : 'Enter the six-character room code your friend shared with you.'}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (modal === 'create') {
                  void createRoom();
                } else {
                  void joinRoom();
                }
              }}
            >
              <label className="form-label">
                Your name
                <input
                  required
                  maxLength={24}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should friends call you?"
                />
              </label>

              {modal === 'create' ? (
                <label className="form-label">
                  Party name
                  <input
                    required
                    maxLength={60}
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Friday Night Cinema"
                  />
                </label>
              ) : (
                <label className="form-label">
                  Room code
                  <input
                    required
                    maxLength={6}
                    className="room-code-input"
                    value={roomCode}
                    onChange={(e) =>
                      setRoomCode(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                      )
                    }
                    placeholder="E.G. WAVE42"
                  />
                </label>
              )}

              {error && <p className="form-error">{error}</p>}

              <button
                disabled={busy}
                className="button button-primary button-large modal-submit"
                type="submit"
              >
                {busy
                  ? 'One sec...'
                  : modal === 'create'
                    ? 'Create my room'
                    : 'Join the party'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="modal-foot">
              <ShieldCheck size={14} /> Private room · No account required
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
