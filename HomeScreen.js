import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, SafeAreaView, Button, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import { useEffect, useState, useCallback, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

export default function HomeScreen({ navigation }) {
  const [earthquakes, setEarthquakes] = useState([]);
  const [filteredEarthquakes, setFilteredEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [magnitudeFilter, setMagnitudeFilter] = useState(0); // 0 = tüm depremler

  useEffect(() => {
    console.log('Component mounted, fetching earthquakes...');
    fetchEarthquakes();
  }, []);

  useEffect(() => {
    // Deprem verileri güncellendiğinde veya filtre değiştiğinde filtreleme yap
    filterEarthquakes();
  }, [earthquakes, magnitudeFilter]);

  const filterEarthquakes = () => {
    if (earthquakes.length === 0) {
      setFilteredEarthquakes([]);
      return;
    }
    
    if (magnitudeFilter === 0) {
      // Filtre yok, tüm depremleri göster
      setFilteredEarthquakes(earthquakes);
    } else {
      // Belirlenen büyüklükte ve üzerindeki depremleri filtrele
      const filtered = earthquakes.filter(quake => quake.mag >= magnitudeFilter);
      setFilteredEarthquakes(filtered);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEarthquakes().finally(() => setRefreshing(false));
  }, []);

  const fetchEarthquakes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching from API...');
      
      // İlk olarak status API'sinden deprem ID'lerini alıyoruz
      const statusResponse = await axios.get('https://api.orhanaydogdu.com.tr/deprem/status');
      
      if (statusResponse.data && statusResponse.data.nopeRedis && statusResponse.data.nopeRedis.keys) {
        console.log('Got earthquake IDs, total:', statusResponse.data.nopeRedis.keys.length);
        
        // İlk 50 deprem ID'sini alıyoruz
        const earthquakeIds = statusResponse.data.nopeRedis.keys
          .filter(key => key.startsWith('data/earthquake/'))
          .map(key => key.replace('data/earthquake/', ''))
          .slice(0, 50);
        
        console.log('Fetching details for earthquake IDs:', earthquakeIds);
        
        // Her bir deprem ID'si için detaylı bilgileri çekiyoruz
        const earthquakePromises = earthquakeIds.map(id => 
          axios.get(`https://api.orhanaydogdu.com.tr/deprem/data/get?earthquake_id=${id}`)
            .then(response => response.data.result)
            .catch(err => {
              console.error(`Error fetching earthquake ID ${id}:`, err);
              return null;
            })
        );
        
        // Tüm isteklerin tamamlanmasını bekliyoruz
        const earthquakeDetails = await Promise.all(earthquakePromises);
        
        // null olmayan sonuçları filtrele
        const validEarthquakes = earthquakeDetails.filter(quake => quake !== null);
        
        console.log(`Successfully fetched ${validEarthquakes.length} earthquakes`);
        setEarthquakes(validEarthquakes);
      } else {
        console.error('Unexpected API response format:', statusResponse.data);
        setError('API yanıt formatı beklendiği gibi değil');
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching earthquake data:", err);
      if (err.response) {
        console.error("Error response status:", err.response.status);
        console.error("Error response data:", err.response.data);
      } else if (err.request) {
        console.error("No response received:", err.request);
      } else {
        console.error("Request error:", err.message);
      }
      setError("Deprem verileri yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
      setLoading(false);
    }
  };

  const navigateToDetail = (earthquake, index) => {
    navigation.navigate('Deprem Detayı', { earthquake });
  };

  const scrollToIndex = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5, // Ortada görüntülemek için
      });
    }
  };

  const getMagnitudeFilterText = () => {
    if (magnitudeFilter === 0) return "Tüm Depremler";
    return `${magnitudeFilter.toFixed(1)}+ Büyüklüğündekiler`;
  };

  const renderEarthquakeItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.earthquakeItem}
      onPress={() => navigateToDetail(item, index)}
    >
      <Text style={styles.location}>{item.title}</Text>
      <Text style={styles.magnitudeRow}>
        <Text style={[styles.magnitude, 
          item.mag < 4 ? styles.lowMagnitude : 
          item.mag < 5 ? styles.mediumMagnitude : 
          styles.highMagnitude]}>
          {item.mag}
        </Text>
        <Text style={styles.normalText}> Şiddetinde</Text>
      </Text>
      <Text style={styles.normalText}>Derinlik: {item.depth} km</Text>
      <Text style={styles.normalText}>Tarih: {item.date}</Text>
      {item.location_properties?.epiCenter?.name && (
        <Text style={styles.normalText}>Merkez Üssü: {item.location_properties.epiCenter.name}</Text>
      )}
      {item.location_properties?.closestCity?.name && (
        <Text style={styles.normalText}>En Yakın Şehir: {item.location_properties.closestCity.name} ({Math.round(item.location_properties.closestCity.distance/1000)} km)</Text>
      )}
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Deprem Büyüklüğü Filtreleme</Text>
          
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Minimum Büyüklük: </Text>
            <Text style={styles.filterValue}>
              {magnitudeFilter === 0 ? "Filtre Yok" : magnitudeFilter.toFixed(1)}
            </Text>
          </View>
          
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={7}
            step={0.1}
            value={magnitudeFilter}
            onValueChange={setMagnitudeFilter}
            minimumTrackTintColor="#1db954"
            maximumTrackTintColor="#333333"
            thumbTintColor="#1db954"
          />
          
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>Tümü</Text>
            <Text style={styles.sliderLabel}>7.0</Text>
          </View>
          
          <View style={styles.filterButtonsRow}>
            <TouchableOpacity 
              style={styles.filterButton} 
              onPress={() => {
                setMagnitudeFilter(0);
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.filterButtonText}>Sıfırla</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, styles.applyButton]} 
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.filterButtonText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1db954" />
        <Text style={styles.loadingText}>Deprem verileri yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchEarthquakes}
        >
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBarPlaceholder} />
      <View style={styles.header}>
        <Text style={styles.headerText}>Son Depremler</Text>
        <TouchableOpacity 
          style={styles.filterButtonContainer} 
          onPress={() => setFilterModalVisible(true)}
        >
          <MaterialCommunityIcons name="filter-variant" size={22} color="white" />
          <Text style={styles.filterButtonText}>Filtrele</Text>
        </TouchableOpacity>
      </View>
      
      {renderFilterModal()}
      
      <View style={styles.filterInfo}>
        <Text style={styles.filterInfoText}>
          {getMagnitudeFilterText()} • {filteredEarthquakes.length} Sonuç
        </Text>
      </View>
      
      {filteredEarthquakes && filteredEarthquakes.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={filteredEarthquakes}
          renderItem={renderEarthquakeItem}
          keyExtractor={(item) => item.earthquake_id || String(Math.random())}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1db954"]}
              tintColor="#1db954"
              progressBackgroundColor="#121212"
            />
          }
          onScrollToIndexFailed={(info) => {
            console.log('Kaydırma başarısız oldu:', info);
            setTimeout(() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToIndex({
                  index: info.index,
                  animated: true,
                });
              }
            }, 100);
          }}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.noDataText}>
            {earthquakes.length > 0 
              ? "Filtreye uygun deprem bulunamadı." 
              : "Deprem verisi bulunamadı."}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchEarthquakes}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      )}
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  statusBarPlaceholder: {
    height: Constants.statusBarHeight || 30,
    backgroundColor: '#1db954',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  header: {
    backgroundColor: '#1db954',
    padding: 15,
    paddingTop: 10,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  filterButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  filterInfo: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  filterInfoText: {
    color: '#ffffff',
    fontSize: 14,
  },
  listContainer: {
    padding: 10,
  },
  earthquakeItem: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  location: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
  },
  magnitudeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  magnitude: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  normalText: {
    color: '#e0e0e0',
  },
  lowMagnitude: {
    color: '#1db954', // Koyu yeşil
  },
  mediumMagnitude: {
    color: '#f4c20d', // Sarımsı
  },
  highMagnitude: {
    color: '#db4437', // Kırmızımsı
  },
  errorText: {
    color: '#db4437',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: '#1db954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noDataText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    color: '#e0e0e0',
    fontSize: 16,
  },
  filterValue: {
    color: '#1db954',
    fontSize: 16,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  sliderLabel: {
    color: '#888888',
    fontSize: 12,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#333333',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  applyButton: {
    backgroundColor: '#1db954',
  },
}); 