import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import axios from 'axios';
import { WebView } from 'react-native-webview';

const BASE_URL = 'https://api.themoviedb.org/3/';
const API_KEY = '20d5092a928c73f98b8e8e3d8dbb4d1e';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const DEFAULT_IMAGE = 'https://via.placeholder.com/100x150';
const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/50';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
}

interface Cast {
  id: number;
  name: string;
  profile_path: string | null;
  character: string;
}

interface MovieDetails extends Movie {
  budget: number;
  revenue: number;
  runtime: number;
  director: string;
  production_companies: { name: string }[];
  videos: { results: { key: string; site: string; type: string }[] };
}

const MainScreen: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [noResults, setNoResults] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [cast, setCast] = useState<Cast[]>([]);

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  const fetchNowPlayingMovies = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}movie/now_playing`, {
        params: {
          api_key: API_KEY,
        },
      });
      setNowPlayingMovies(response.data.results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setNoResults(false);
    fetchSuggestions(text);
  };

  const fetchSuggestions = async (query: string) => {
    if (query.length === 0) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}search/movie`, {
        params: {
          api_key: API_KEY,
          query: query,
        },
      });
      setSuggestions(response.data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const searchMovies = async () => {
    if (!searchText) {
      alert('Please enter a movie title to search.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}search/movie`, {
        params: {
          api_key: API_KEY,
          query: searchText,
        },
      });

      if (response.data.results.length === 0) {
        setNoResults(true);
        setSearchResults([]);
      } else {
        setNoResults(false);
        setSearchResults(response.data.results);
      }
      setSuggestions([]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRandomMovie = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}movie/popular`, {
        params: {
          api_key: API_KEY,
          page: Math.floor(Math.random() * 500) + 1,
        },
      });

      const randomIndex = Math.floor(Math.random() * response.data.results.length);
      const randomMovie = response.data.results[randomIndex];
      await fetchMovieDetails(randomMovie.id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovieDetails = async (movieId: number) => {
    try {
      const response = await axios.get(`${BASE_URL}movie/${movieId}`, {
        params: {
          api_key: API_KEY,
          append_to_response: 'credits,videos',
        },
      });

      const movieDetails: MovieDetails = {
        ...response.data,
        director: response.data.credits.crew.find((member: any) => member.job === 'Director')?.name || 'Unknown',
      };

      setSelectedMovie(movieDetails);
      setCast(response.data.credits.cast.slice(0, 5));
      setModalVisible(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenMovieInfo = (movie: Movie) => {
    fetchMovieDetails(movie.id);
  };

  const handleCloseMovieInfo = () => {
    setSelectedMovie(null);
    setModalVisible(false);
    setCast([]);
  };

  const refreshPage = () => {
    setSearchText('');
    setSearchResults([]);
    setNoResults(false);
    fetchNowPlayingMovies();
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSuggestions([]);
  };

  const renderSuggestionItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity onPress={() => handleOpenMovieInfo(item)}>
      <Text style={styles.suggestionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={refreshPage} style={styles.titleContainer}>
        <Text style={styles.title}>Movie Fetcher</Text>
      </TouchableOpacity>
      <View style={styles.searchContainer}>
        <TextInput
          value={searchText}
          onChangeText={handleSearchChange}
          placeholder="Search for movies..."
          style={styles.searchInput}
          placeholderTextColor="#aaa"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>X</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={searchMovies} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          renderItem={renderSuggestionItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.suggestionsList}
        />
      )}
      <TouchableOpacity onPress={fetchRandomMovie} style={styles.randomButton}>
        <Text style={styles.randomButtonText}>Random Movie</Text>
      </TouchableOpacity>
      {isLoading ? (
        <ActivityIndicator size="large" color="#E50914" style={styles.loading} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {searchResults.length === 0 && nowPlayingMovies.length > 0 && (
            <View style={styles.nowPlayingContainer}>
              <Text style={styles.sectionTitle}>Now Playing</Text>
              <View style={styles.moviesGrid}>
                {nowPlayingMovies.map((movie) => (
                  <TouchableOpacity key={movie.id} style={styles.movieItem} onPress={() => handleOpenMovieInfo(movie)}>
                    <Image
                      source={{ uri: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : DEFAULT_IMAGE }}
                      style={styles.moviePoster}
                    />
                    <Text style={styles.movieTitle}>{movie.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              <View style={styles.moviesGrid}>
                {searchResults.map((movie) => (
                  <TouchableOpacity key={movie.id} style={styles.movieItem} onPress={() => handleOpenMovieInfo(movie)}>
                    <Image
                      source={{ uri: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : DEFAULT_IMAGE }}
                      style={styles.moviePoster}
                    />
                    <Text style={styles.movieTitle}>{movie.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
      <Modal visible={modalVisible} transparent={true} onRequestClose={handleCloseMovieInfo}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedMovie && (
              <ScrollView contentContainerStyle={styles.modalScrollContainer}>
                <Image
                  source={{ uri: selectedMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}${selectedMovie.poster_path}` : DEFAULT_IMAGE }}
                  style={styles.modalPoster}
                />
                <Text style={styles.modalTitle}>{selectedMovie.title}</Text>
                <Text style={styles.modalText}>Release Date: {selectedMovie.release_date}</Text>
                <Text style={styles.modalText}>Overview: {selectedMovie.overview}</Text>
                <Text style={styles.modalText}>Budget: ${selectedMovie.budget.toLocaleString()}</Text>
                <Text style={styles.modalText}>Revenue: ${selectedMovie.revenue.toLocaleString()}</Text>
                <Text style={styles.modalText}>Runtime: {selectedMovie.runtime} minutes</Text>
                <Text style={styles.modalText}>Director: {selectedMovie.director}</Text>
                <Text style={styles.modalText}>Production Companies: {selectedMovie.production_companies.map(company => company.name).join(', ')}</Text>
                {selectedMovie.videos.results.length > 0 && (
                  <WebView
                    source={{ uri: `https://www.youtube.com/embed/${selectedMovie.videos.results[0].key}` }}
                    style={styles.video}
                  />
                )}
                <Text style={styles.modalCastTitle}>Top Cast</Text>
                {cast.map((member) => (
                  <View key={member.id} style={styles.castMember}>
                    <Image
                      source={{ uri: member.profile_path ? `${TMDB_IMAGE_BASE_URL}${member.profile_path}` : DEFAULT_PROFILE_IMAGE }}
                      style={styles.castImage}
                    />
                    <View style={styles.castDetails}>
                      <Text style={styles.castName}>{member.name}</Text>
                      <Text style={styles.castCharacter}>{member.character}</Text>
                    </View>
                  </View>
                ))}
                <TouchableOpacity onPress={handleCloseMovieInfo}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      {noResults && (
        <Text style={styles.noResults}>No results found for "{searchText}".</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#141414',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E50914',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#E50914',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 16,
    color: '#fff',
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#E50914',
    borderRadius: 20,
    padding: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
    padding: 10,
  },
  clearButtonText: {
    color: '#E50914',
    fontSize: 16,
  },
  suggestionsList: {
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 16,
  },
  suggestionText: {
    padding: 12,
    fontSize: 16,
    color: '#fff',
  },
  randomButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E50914',
    borderRadius: 20,
    padding: 10,
    marginBottom: 16,
  },
  randomButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loading: {
    marginTop: 32,
  },
  scrollContainer: {
    paddingBottom: 24,
  },
  nowPlayingContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  moviesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  movieItem: {
    width: '48%',
    marginBottom: 16,
  },
  moviePoster: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  searchResults: {
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: '#1c1c1c',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
  },
  modalScrollContainer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  modalPoster: {
    width: 200,
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalCastTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  castMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  castImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  castDetails: {
    flex: 1,
  },
  castName: {
    fontSize: 16,
    color: '#fff',
  },
  castCharacter: {
    fontSize: 14,
    color: '#aaa',
  },
  video: {
    width: 320,
    height: 180,
    marginTop: 16,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#E50914',
    marginTop: 16,
  },
  noResults: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default MainScreen;
