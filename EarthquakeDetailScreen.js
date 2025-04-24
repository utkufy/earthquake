import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator, SafeAreaView, Platform, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

// Karanlık harita stili
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

export default function EarthquakeDetailScreen({ route, navigation }) {
  const { earthquake } = route.params;
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 1,
    longitudeDelta: 1,
  });

  useEffect(() => {
    // Deprem verisinden konum bilgisini al
    if (earthquake && earthquake.geojson && earthquake.geojson.coordinates) {
      const [longitude, latitude] = earthquake.geojson.coordinates;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 1,
        longitudeDelta: 1,
      });
    }

    // Kullanıcı konumunu al
    getUserLocation();
  }, [earthquake]);

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Konum izni gerekli',
          'Bu uygulama için konum izni gereklidir. Konumunuzu kullanarak size yakın depremleri göstereceğiz.',
          [{ text: 'Tamam' }]
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLoading(false);
    } catch (err) {
      console.error('Konum alınamadı:', err);
      setLoading(false);
    }
  };

  const getMagnitudeColor = (magnitude) => {
    if (magnitude < 4) return '#1db954'; // Koyu yeşil
    if (magnitude < 5) return '#f4c20d'; // Sarımsı
    return '#db4437'; // Kırmızımsı
  };

  const getDistance = () => {
    if (!userLocation || !earthquake.geojson || !earthquake.geojson.coordinates) {
      return null;
    }

    // Haversine formülü ile kuş uçuşu mesafeyi hesapla
    const [longitude, latitude] = earthquake.geojson.coordinates;
    const R = 6371; // Dünyanın yarıçapı (km)
    const dLat = deg2rad(userLocation.latitude - latitude);
    const dLon = deg2rad(userLocation.longitude - longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(latitude)) * Math.cos(deg2rad(userLocation.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Kilometre cinsinden

    return Math.round(distance);
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1db954" />
        <Text style={styles.loadingText}>Konum bilgisi yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBarPlaceholder} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{earthquake.title}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>Deprem Bilgileri</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Büyüklük:</Text>
          <Text style={[styles.value, { color: getMagnitudeColor(earthquake.mag) }]}>
            {earthquake.mag}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Derinlik:</Text>
          <Text style={styles.value}>{earthquake.depth} km</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tarih:</Text>
          <Text style={styles.value}>{earthquake.date}</Text>
        </View>

        {earthquake.location_properties?.epiCenter?.name && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Merkez Üssü:</Text>
            <Text style={styles.value}>{earthquake.location_properties.epiCenter.name}</Text>
          </View>
        )}

        {earthquake.location_properties?.closestCity?.name && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>En Yakın Şehir:</Text>
            <Text style={styles.value}>
              {earthquake.location_properties.closestCity.name} ({Math.round(earthquake.location_properties.closestCity.distance/1000)} km)
            </Text>
          </View>
        )}

        {getDistance() && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Size Uzaklığı:</Text>
            <Text style={styles.value}>{getDistance()} km</Text>
          </View>
        )}
      </View>

      <MapView 
        style={styles.map} 
        region={region}
        onRegionChangeComplete={setRegion}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : null}
        customMapStyle={darkMapStyle}
      >
        {/* Deprem konumu */}
        {earthquake.geojson && earthquake.geojson.coordinates && (
          <>
            <Circle
              center={{
                latitude: earthquake.geojson.coordinates[1],
                longitude: earthquake.geojson.coordinates[0],
              }}
              radius={earthquake.mag * 10000} // Büyüklüğe göre etki alanı (metre)
              strokeWidth={1}
              strokeColor={getMagnitudeColor(earthquake.mag)}
              fillColor={`${getMagnitudeColor(earthquake.mag)}40`} // %25 şeffaf
            />
            <Marker
              coordinate={{
                latitude: earthquake.geojson.coordinates[1],
                longitude: earthquake.geojson.coordinates[0],
              }}
              title={earthquake.title}
              description={`Büyüklük: ${earthquake.mag}, Derinlik: ${earthquake.depth} km`}
            >
              <View style={[
                styles.markerCircle, 
                { 
                  width: 30, 
                  height: 30, 
                  borderRadius: 15,
                  backgroundColor: getMagnitudeColor(earthquake.mag),
                }
              ]}>
                <Text style={styles.markerText}>{earthquake.mag}</Text>
              </View>
            </Marker>
          </>
        )}

        {/* Kullanıcı konumu */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Konumunuz"
            pinColor="#1db954"
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}
      </MapView>
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
    flexDirection: 'row',
    position: 'relative',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 15,
    backgroundColor: '#1e1e1e',
    margin: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    width: '40%',
    color: '#e0e0e0',
  },
  value: {
    fontSize: 14,
    flex: 1,
    color: '#e0e0e0',
  },
  map: {
    flex: 1,
    marginTop: 10,
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
    fontSize: 14,
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
  centerContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
}); 