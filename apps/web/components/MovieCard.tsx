
'use client';

import type { Movie } from '../lib/types';
import { Plus, Play, Sparkles } from 'lucide-react';

export default function MovieCard({
  movie,
  onWatch,
  onAdd,
  compact = false,
}: {
  movie: Movie;
  onWatch?: (movie: Movie) => void;
  onAdd?: (movie: Movie) => void;
  compact?: boolean;
}) {
  return (
    <article
      className={`movie-card movie-card-premium ${
        compact ? 'movie-card-compact' : ''
      }`}
      style={{ ['--accent' as string]: movie.accent }}
    >
      <button
        type="button"
        className="poster-button"
        onClick={() => onWatch?.(movie)}
        aria-label={`Watch ${movie.title}`}
      >
        <div
          className="poster-art poster-art-premium"
          style={{
            backgroundImage: `
              linear-gradient(
                180deg,
                rgba(7, 8, 16, .08) 0%,
                rgba(7, 8, 16, .02) 36%,
                rgba(7, 8, 16, .70) 67%,
                rgba(7, 8, 16, .98) 100%
              ),
              url("${movie.poster}")
            `,
          }}
        >
          <div className="poster-topline">
            <span className="poster-brand">
              <Sparkles size={11} />
              WATCHWAVE PICKS
            </span>
            <span className="poster-star" aria-hidden="true">✦</span>
          </div>

          <div className="poster-content">
            <span className="poster-kicker">
              {movie.year} · FEATURED FILM
            </span>
            <span className="poster-title">{movie.title}</span>
            <span className="poster-subtitle">
              {movie.genres.slice(0, 2).join(' · ')}
            </span>
          </div>

          <span className="poster-play" aria-hidden="true">
            <Play size={18} fill="currentColor" />
          </span>
        </div>
      </button>

      <div className="movie-meta">
        <div className="movie-meta-copy">
          <h3>{movie.title}</h3>
          <p>
            {movie.year}
            <span> · </span>
            {movie.genres[0]}
          </p>
        </div>
        <span className="rating">OPEN FILM</span>
      </div>

      {!compact && (
        <div className="movie-actions">
          <button
            type="button"
            className="button button-quiet button-small movie-watch-button"
            onClick={() => onWatch?.(movie)}
          >
            <Play size={13} fill="currentColor" />
            Watch now
          </button>

          <button
            type="button"
            className="icon-button tiny movie-add-button"
            aria-label={`Add ${movie.title} to playlist`}
            title="Add to playlist"
            onClick={() => onAdd?.(movie)}
          >
            <Plus size={17} />
          </button>
        </div>
      )}
    </article>
  );
}
