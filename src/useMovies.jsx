import { useState, useEffect } from "react";

const KEY = "de1d3869";

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
      callback?.();
      const controller = new AbortController(); // create AbortController instance

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal } // take signal property from AbortController object to have connection between fetch and abort()
          );

          if (!res.ok) throw new Error("Something went wrong");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");
          setMovies(data.Search);

          setIsLoading(false);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            // we need to exempt this error from other errors as every abort is considered as error and it prevent in right work of app
            console.error(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
  
      fetchMovies();

      return function () {
        controller.abort(); // stop fetch requests from search input
      };
    },

    [query]
  );

  return { movies, isLoading, error };
}
