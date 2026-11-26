const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const MovieCard = ({ movie: { id, title, vote_average, poster_path, release_date, original_language } }) => {
  const openImdbPage = async () => {
    // Open the tab right away so the browser doesn't block it as a popup
    const newTab = window.open('', '_blank');

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/external_ids`,
        API_OPTIONS
      );
      const data = await response.json();

      const url = data.imdb_id
        ? `https://www.imdb.com/title/${data.imdb_id}/`
        : `https://www.themoviedb.org/movie/${id}`;

      if (newTab) newTab.location.href = url;
    } catch (error) {
      console.error(`Error opening IMDb page: ${error}`);
      if (newTab) newTab.close();
    }
  }

  return (
    <div className="movie-card cursor-pointer" onClick={openImdbPage}>
      <img
        src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '/no-movie.png'}
        alt={title}
      />

      <div className="mt-4">
        <h3>{title}</h3>

        <div className="content">
          <div className="rating">
            <img src="/star.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>

          <span>•</span>
          <p className="lang">{original_language}</p>

          <span>•</span>
          <p className="year">
            {release_date ? release_date.split('-')[0] : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MovieCard