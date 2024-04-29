import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  ActivityIndicator,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import axios from 'axios';

const BASE_URL = 'https://api.themoviedb.org/3/';
const API_KEY = '20d5092a928c73f98b8e8e3d8dbb4d1e'; // Replace with your actual TMDb API key
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Base URL for TMDb images
const DEFAULT_IMAGE = 'https://via.placeholder.com/100x150'; // Default image URL (replace with your preferred placeholder)

const MainScreen = () => {
  const [searchText, setSearchText] = useState(''); // State for search text
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const [selectedMovie, setSelectedMovie] = useState(null); // State to store details of the selected movie
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [noResults, setNoResults] = useState(false); // State for no results found

  const handleSearchChange = (text) => {
    setSearchText(text);
    setNoResults(false); // Reset no results state when search text changes
  };

  const searchMovies = async () => {
    if (!searchText) {
      alert('Please enter a movie title to search.');
      return; // Do nothing if search text is empty
    }

    setIsLoading(true); // Show loading indicator while searching
    try {
      const response = await axios.get(`${BASE_URL}search/movie`, {
        params: {
          api_key: API_KEY,
          query: searchText,
        },
      });

      if (response.data.results.length === 0) {
        setNoResults(true); // Set no results state if search returns empty
      } else {
        setSearchResults(response.data.results);
      }
    } catch (error) {
      console.error(error); // Handle errors gracefully (e.g., display an error message)
    } finally {
      setIsLoading(false); // Hide loading indicator after searching
    }
  };

  const fetchRandomMovie = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}movie/popular`, {
        params: {
          api_key: API_KEY,
          page: Math.floor(Math.random() * 500) + 1, // Fetch a random page from popular movies
        },
      });

      const randomIndex = Math.floor(Math.random() * response.data.results.length);
      const randomMovie = response.data.results[randomIndex];
      setSelectedMovie(randomMovie);
      setModalVisible(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMovieInfo = (movie) => {
    setSelectedMovie(movie); // Set the selected movie state
    setModalVisible(true); // Show modal
  };

  const handleCloseMovieInfo = () => {
    setSelectedMovie(null); // Reset selected movie state to close movie info
    setModalVisible(false); // Hide modal
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Movie Fetcher</Text>
      <View style={styles.searchContainer}>
        <TextInput
          value={searchText}
          onChangeText={handleSearchChange}
          placeholder="Search for movies..."
          style={styles.searchInput}
          placeholderTextColor="#ddd"
        />
        <Button title="Search" onPress={searchMovies} color="#007bff" />
      </View>
      <Button title="Random Movie" onPress={fetchRandomMovie} color="#007bff" />
      {isLoading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loading} />
      ) : (
        searchResults.length > 0 ? (
          <View style={styles.searchResults}>
            <Text style={styles.searchResultsTitle}>Search Results:</Text>
            {searchResults.map((movie) => (
              <View key={movie.id} style={styles.movieItem}>
                {movie.poster_path && (
                  <Image
                    source={{ uri: `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` }}
                    style={styles.moviePoster}
                  />
                )}
                {!movie.poster_path && (
                  <Image
                    source={{ uri: DEFAULT_IMAGE }}
                    style={styles.moviePoster}
                  />
                )}
                <Text style={styles.movieTitle}>{movie.title}</Text>
                <Button
                  title="Show Info"
                  onPress={() => handleOpenMovieInfo(movie)}
                  color="#007bff"
                />
              </View>
            ))}
          </View>
        ) : null // No need to render anything when there are no search results
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseMovieInfo}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Movie Details:</Text>
            {selectedMovie && (
              <>
                <Image
                  source={{ uri: `${TMDB_IMAGE_BASE_URL}${selectedMovie.poster_path}` }}
                  style={styles.modalPoster}
                />
                <Text style={styles.modalText}>{selectedMovie.title}</Text>
                <Text style={styles.modalText}>Release Date: {selectedMovie.release_date}</Text>
                <Text style={styles.modalText}>Overview: {selectedMovie.overview}</Text>
              </>
            )}
            <Button
              title="Close"
              onPress={handleCloseMovieInfo}
              color="#007bff"
            />
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
    backgroundColor: '#000', // Dark background
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center', // Center title text
    marginBottom: 24,
    color: '#fff', // White text color
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#333', // Dark gray background for input field
    borderColor: '#555', // Dark gray border
    borderWidth: 1,
    borderRadius: 8, // Rounded corners for input field
    paddingHorizontal: 16,
    marginRight: 8,
    color: '#fff', // White text color
  },
  loading: {
    marginTop: 20,
  },
  searchResults: {
    width: '100%',
  },
  searchResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff', // White text color
  },
  movieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1, // Add a border to separate movie items
    borderBottomColor: '#555', // Dark gray border color
    paddingBottom: 8,
  },
  moviePoster: {
    width: 100,
    height: 150,
    marginRight: 16,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: '#fff', // White text color
  },
  noResults: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center', // Center text for no results message
    color: '#fff', // White text color
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  },
  modalContent: {
    backgroundColor: '#333', // Dark gray background
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff', // White text color
  },
  modalPoster: {
    width: 200,
    height: 300,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#fff', // White text color
  },
  infoButton: {
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#555', // Dark gray background for close button
    color: '#fff', // White text color for close button
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8, // Rounded corners for button
  },
});

export default MainScreen;
