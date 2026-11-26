import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { openImdbPage } from '../openMovie.js'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

const MovieModal = ({ movieId, onClose }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [playTrailer, setPlayTrailer] = useState(false);

  // Fetch full details and videos for this movie in one request
  useEffect(() => {
    let cancelled = false;

    fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=videos`,
      API_OPTIONS
    )
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch movie details');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setDetails(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setHasError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  // Close with Esc and stop the page behind from scrolling
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  // Pick the official trailer (fall back to a teaser)
  const videos = details?.videos?.results || [];
  const youtubeVideos = videos.filter((video) => video.site === 'YouTube');
  const trailer =
    youtubeVideos.find((video) => video.type === 'Trailer') ||
    youtubeVideos.find((video) => video.type === 'Teaser');

  const year = details?.release_date ? details.release_date.split('-')[0] : 'N/A';

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-[#0f0d23] border border-white/10 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-white/20 text-xl cursor-pointer"
        >
          ✕
        </button>

        {isLoading && <p className="p-10 text-center text-gray-300">Loading...</p>}

        {hasError && (
          <p className="p-10 text-center text-red-500">
            Could not load movie details. Please try again.
          </p>
        )}

        {details && (
          <div className="p-5 sm:p-6">
            {playTrailer && trailer ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg mb-5">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1`}
                  title={`${details.title} trailer`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-5">
              <img
                src={
                  details.poster_path
                    ? `https://image.tmdb.org/t/p/w342${details.poster_path}`
                    : '/no-movie.png'
                }
                alt={details.title}
                className="w-40 sm:w-48 self-center sm:self-start rounded-lg"
              />

              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-bold pr-10">
                  {details.title} <span className="text-gray-400 font-normal">({year})</span>
                </h2>

                {details.tagline && (
                  <p className="text-sm italic text-gray-400">{details.tagline}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-300">
                  <span>⭐ {details.vote_average ? details.vote_average.toFixed(1) : 'N/A'}</span>
                  <span>•</span>
                  <span>{formatRuntime(details.runtime)}</span>
                  <span>•</span>
                  <span className="uppercase">{details.original_language}</span>
                </div>

                {details.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {details.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 rounded-full bg-white/10 text-xs"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm leading-relaxed text-gray-200">
                  {details.overview || 'No overview available.'}
                </p>

                <div className="flex flex-wrap gap-3 mt-2">
                  {trailer ? (
                    <button
                      onClick={() => setPlayTrailer(!playTrailer)}
                      className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 text-sm cursor-pointer"
                    >
                      {playTrailer ? 'Hide Trailer' : '▶ Play Trailer'}
                    </button>
                  ) : (
                    <span className="px-4 py-2 rounded-md bg-white/5 text-sm text-gray-400">
                      No trailer available
                    </span>
                  )}

                  <button
                    onClick={() => openImdbPage(details.id)}
                    className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm cursor-pointer"
                  >
                    Open on IMDb
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default MovieModal