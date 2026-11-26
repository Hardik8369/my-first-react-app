const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

export const openImdbPage = async (id) => {
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