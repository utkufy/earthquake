import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator, SafeAreaView, Platform, Alert, TouchableOpacity, Modal, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import Constants from 'expo-constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Komponentler
import EarthquakeMarker from './components/EarthquakeMarker';
import EmergencyMeetingPoint from './components/EmergencyMeetingPoint';
import UserLocationMarker from './components/UserLocationMarker';
import RoutePolyline from './components/RoutePolyline';
import RouteInfoBar from './components/RouteInfoBar';
import DirectionsModal from './components/DirectionsModal';

// Yardımcı fonksiyonlar ve veriler
import { generateSimulatedRoute, generateSimulatedDirections } from './utils/routeUtils';
import { darkMapStyle } from './data/mapStyles';
import emergencyMeetingPoints from './data/emergencyMeetingPoints';

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 39.1667, // Türkiye'nin yaklaşık merkezi
    longitude: 35.6667,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeDirections, setRouteDirections] = useState([]);
  const [directionsModalVisible, setDirectionsModalVisible] = useState(false);

  useEffect(() => {
    // Paralel olarak konum ve deprem verileri alınıyor
    const fetchData = async () => {
      try {
        // Aynı anda hem konum hem deprem verilerini başlat
        const locationPromise = getUserLocation();
        const earthquakesPromise = fetchEarthquakes();
        
        // İki işlemi de bekle
        await Promise.all([locationPromise, earthquakesPromise]);
      } catch (err) {
        console.error('Veri yükleme hatası:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Seçilen toplanma noktasına rota oluştur
  useEffect(() => {
    if (selectedMeetingPoint && userLocation) {
      generateRoute();
    }
  }, [selectedMeetingPoint, userLocation]);

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Konum izni gerekli',
          'Bu uygulama için konum izni gereklidir. Konumunuzu kullanarak size yakın depremleri göstereceğiz.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.Balanced,
        // Timeout ayarı - 10 saniye içinde alamazsa devam et
        timeInterval: 10000 
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 5,
        longitudeDelta: 5,
      });
    } catch (err) {
      console.error('Konum alınamadı:', err);
      // Konum alınamazsa hatayı göstermeden devam et
    }
  };

  const fetchEarthquakes = async () => {
    try {
      // İlk olarak status API'sinden deprem ID'lerini alıyoruz
      const statusResponse = await axios.get('https://api.orhanaydogdu.com.tr/deprem/status');
      
      if (statusResponse.data && statusResponse.data.nopeRedis && statusResponse.data.nopeRedis.keys) {
        // İlk 25 deprem ID'sini alıyoruz - daha az veri daha hızlı yükleme
        const earthquakeIds = statusResponse.data.nopeRedis.keys
          .filter(key => key.startsWith('data/earthquake/'))
          .map(key => key.replace('data/earthquake/', ''))
          .slice(0, 25);
        
        // Her bir deprem ID'si için detaylı bilgileri paralel olarak çekiyoruz
        const earthquakePromises = earthquakeIds.map(id => 
          axios.get(`https://api.orhanaydogdu.com.tr/deprem/data/get?earthquake_id=${id}`, {
            // Timeout ayarı - 5 saniye içinde cevap gelmezse işlemi iptal et
            timeout: 5000
          })
            .then(response => response.data.result)
            .catch(err => {
              console.error(`Error fetching earthquake ID ${id}:`, err);
              return null;
            })
        );
        
        // Tüm isteklerin tamamlanmasını bekliyoruz
        const earthquakeDetails = await Promise.all(earthquakePromises);
        
        // null olmayan ve geojson verisi olan sonuçları filtrele
        const validEarthquakes = earthquakeDetails.filter(quake => 
          quake !== null && quake.geojson && quake.geojson.coordinates
        );
        
        setEarthquakes(validEarthquakes);
        
        // Eğer depremler varsa ve konum alınamadıysa, ilk depremin konumuna yakınlaştır
        if (validEarthquakes.length > 0 && !userLocation) {
          const latestEarthquake = validEarthquakes[0];
          const [longitude, latitude] = latestEarthquake.geojson.coordinates;
          
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 5,
            longitudeDelta: 5,
          });
        }
      } else {
        setError('API yanıt formatı beklendiği gibi değil');
      }
    } catch (err) {
      console.error("Error fetching earthquake data:", err);
      setError("Deprem verileri yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
      throw err; // Hata üst fonksiyona iletilsin
    }
  };

  const navigateToDetail = (earthquake) => {
    navigation.navigate('Deprem Detayı', { earthquake });
  };

  const getMagnitudeColor = (magnitude) => {
    if (magnitude < 4) return '#1db954'; // Koyu yeşil
    if (magnitude < 5) return '#f4c20d'; // Sarımsı
    return '#db4437'; // Kırmızımsı
  };

  const getMarkerSize = (magnitude) => {
    // Magnitude'a göre marker boyutunu belirle - daha büyük değerler
    return Math.max(20, Math.min(40, magnitude * 7));
  };

  // Seçilen toplanma noktasına rota oluştur
  const generateRoute = () => {
    if (!selectedMeetingPoint || !userLocation) return;

    // Rota oluştur
    const startLoc = userLocation;
    const endLoc = selectedMeetingPoint.coordinate;
    
    // Simulate a route
    const simulatedRoute = generateSimulatedRoute(startLoc, endLoc);
    setRouteCoordinates(simulatedRoute);

    // Generate directions
    const directions = generateSimulatedDirections(selectedMeetingPoint.name);
    setRouteDirections(directions);
  };

  // Rota temizleme
  const clearRoute = () => {
    setSelectedMeetingPoint(null);
    setRouteCoordinates([]);
    setRouteDirections([]);
    setDirectionsModalVisible(false);
  };

  const handleMeetingPointSelect = (point) => {
    setSelectedMeetingPoint(point);
  };

  const showDirectionsModal = () => {
    setDirectionsModalVisible(true);
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

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
          onPress={() => {
            setLoading(true);
            setError(null);
            const fetchData = async () => {
              try {
                await fetchEarthquakes();
              } catch (err) {
                console.error('Yeniden yükleme hatası:', err);
                setError('Veriler yüklenirken bir hata oluştu.');
              } finally {
                setLoading(false);
              }
            };
            fetchData();
          }}
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
        <Text style={styles.headerText}>Deprem Haritası</Text>
      </View>
      
      {/* Rota bilgisi çubuğu */}
      <RouteInfoBar 
        meetingPoint={selectedMeetingPoint}
        onDirectionsPress={showDirectionsModal}
        onClearRoute={clearRoute}
      />
      
      <MapView 
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChange}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : null}
        showsUserLocation={true}
        showsMyLocationButton={true}
        customMapStyle={darkMapStyle}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
        zoomControlEnabled={true}
        minZoomLevel={2}
        maxZoomLevel={18}
      >
        {/* Kullanıcı konumu */}
        <UserLocationMarker coordinate={userLocation} />
        
        {/* Deprem toplanma alanları */}
        {emergencyMeetingPoints.map((point) => (
          <EmergencyMeetingPoint 
            key={point.id}
            point={point} 
            onSelect={handleMeetingPointSelect} 
          />
        ))}
        
        {/* Deprem imleçleri */}
        {earthquakes.map((earthquake) => (
          <EarthquakeMarker 
            key={earthquake.earthquake_id || Math.random().toString()}
            earthquake={earthquake} 
            onPress={navigateToDetail} 
          />
        ))}
        
        {/* Rota çizgisi */}
        <RoutePolyline coordinates={routeCoordinates} />
      </MapView>
      
      {/* Yol tarifi modalı */}
      <DirectionsModal 
        visible={directionsModalVisible}
        meetingPoint={selectedMeetingPoint}
        directions={routeDirections}
        onClose={() => setDirectionsModalVisible(false)}
        onClearRoute={clearRoute}
      />
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
  header: {
    backgroundColor: '#1db954',
    padding: 15,
    paddingTop: 10,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#db4437',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ffffff',
  },
  retryButton: {
    backgroundColor: '#1db954',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  markerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16, // Daha büyük yazı tipi
  },
  calloutContainer: {
    width: 200,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
    color: 'white',
  },
  calloutText: {
    fontSize: 12,
    marginTop: 2,
    color: '#e0e0e0',
  },
  detailLink: {
    fontSize: 12,
    color: '#1db954',
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(29, 185, 84, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1db954',
    borderWidth: 2,
    borderColor: 'white',
  },
  meetingPointMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5677fc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  meetingPointCallout: {
    width: 220,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  meetingPointTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  meetingPointDescription: {
    fontSize: 12,
    color: '#e0e0e0',
    marginBottom: 5,
  },
  meetingPointCapacity: {
    fontSize: 12,
    color: '#e0e0e0',
    marginBottom: 5,
  },
  meetingPointDirections: {
    fontSize: 12,
    color: '#5677fc',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  routeInfoBar: {
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  routeInfoContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeInfoText: {
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  directionsButton: {
    backgroundColor: '#1db954',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeRouteButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#1db954',
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  directionsContainer: {
    padding: 15,
  },
  directionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  directionNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1db954',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  directionNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  directionText: {
    color: '#e0e0e0',
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#333333',
  },
  clearButton: {
    backgroundColor: '#db4437',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 