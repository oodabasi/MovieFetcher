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

const BASE_URL = 'https://api.themoviedb.org/3/search/movie';
const API_KEY = 'Api-Key-To-Use'; // Replace with your actual TMDb API key
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Base URL for TMDb images
const DEFAULT_IMAGE = 'https://via.placeholder.com/100x150'; // Default image URL (replace with your preferred placeholder)

const MainScreen = () => {
  const [searchText, setSearchText] = useState(''); // State for search text
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const [selectedMovie, setSelectedMovie] = useState(null); // State to store details of the selected movie
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  const handleSearchChange = (text) => {
    setSearchText(text);
  };

  const searchMovies = async () => {
    if (!searchText) {
      alert('Please enter a movie title to search.');
      return; // Do nothing if search text is empty
    }

    setIsLoading(true); // Show loading indicator while searching
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          api_key: API_KEY,
          query: searchText,
        },
      });

      setSearchResults(response.data.results);
    } catch (error) {
      console.error(error); // Handle errors gracefully (e.g., display an error message)
    } finally {
      setIsLoading(false); // Hide loading indicator after searching
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
      <Text style={styles.title}>Movie Search</Text>
      <TextInput
        value={searchText}
        onChangeText={handleSearchChange}
        placeholder="Search for movies..."
        style={styles.searchInput}
      />
      <Button title="Search" onPress={searchMovies} style={styles.searchButton} />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
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
                  style={styles.infoButton}
                />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noResults}>No results found for "{searchText}".</Text>
        )
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
              style={styles.closeButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchButton: {
    marginBottom: 16,
  },
  loading: {
    marginTop: 20,
  },
  searchResults: {
    width: '100%',
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  movieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moviePoster: {
    width: 100,
    height: 150,
    marginRight: 10,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  noResults: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalPoster: {
    width: 200,
    height: 300,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  infoButton: {
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 10,
  },
});

export default MainScreen;
