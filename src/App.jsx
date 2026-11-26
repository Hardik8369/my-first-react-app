import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);

  const [suggestedMovies, setSuggestedMovies] = useState([]);
  const [suggestionTitle, setSuggestionTitle] = useState('');

  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  // When a search finds nothing, find similar or popular movies to suggest
  const loadSuggestions = async (query) => {
    // Try shorter versions of the search (handles typos at the end)
    let shorter = query.trim();

    for (let attempt = 0; attempt < 5 && shorter.length > 3; attempt++) {
      shorter = shorter.slice(0, -1);

      const response = await fetch(
        `${API_BASE_URL}/search/movie?query=${encodeURIComponent(shorter)}`,
        API_OPTIONS
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setSuggestionTitle('Similar movies you might like');
        setSuggestedMovies(data.results.slice(0, 10));
        return;
      }
    }

    // Still nothing, so show popular movies instead
    const response = await fetch(
      `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`,
      API_OPTIONS
    );
    const data = await response.json();

    setSuggestionTitle('Popular movies you might like');
    setSuggestedMovies((data.results || []).slice(0, 10));
  }

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    setSuggestedMovies([]);

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      const results = data.results || [];
      setMovieList(results);

      if(query && results.length > 0) {
        await updateSearchCount(query, results[0]);
      }

      if(query && results.length === 0) {
        await loadSuggestions(query);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies || []);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {!searchTerm && trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : movieList.length === 0 && debouncedSearchTerm ? (
            <div>
              <p className="text-gray-100 text-lg">
                No results found for "{debouncedSearchTerm}".
              </p>

              {suggestedMovies.length > 0 && (
                <div className="mt-10">
                  <h2>{suggestionTitle}</h2>

                  <ul>
                    {suggestedMovies.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App