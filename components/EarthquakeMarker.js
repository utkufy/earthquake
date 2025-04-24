import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';

const EarthquakeMarker = ({ earthquake, onPress }) => {
  if (!earthquake.geojson || !earthquake.geojson.coordinates) return null;
  
  const [longitude, latitude] = earthquake.geojson.coordinates;
  const markerSize = getMarkerSize(earthquake.mag);
  const markerColor = getMagnitudeColor(earthquake.mag);
  
  return (
    <Marker
      key={earthquake.earthquake_id}
      coordinate={{
        latitude,
        longitude
      }}
      pinColor={markerColor}
      onPress={() => onPress(earthquake)}
    >
      <View style={[
        styles.markerCircle, 
        { 
          width: markerSize, 
          height: markerSize, 
          borderRadius: markerSize / 2,
          backgroundColor: markerColor,
        }
      ]}>
        <Text style={[styles.markerText, { fontSize: markerSize / 2.5 }]}>{earthquake.mag}</Text>
      </View>
      
      <Callout tooltip onPress={() => onPress(earthquake)}>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{earthquake.title}</Text>
          <Text style={styles.calloutText}>Şiddet: {earthquake.mag}</Text>
          <Text style={styles.calloutText}>Derinlik: {earthquake.depth} km</Text>
          <Text style={styles.calloutText}>Tarih: {earthquake.date}</Text>
          {earthquake.location_properties?.epiCenter?.name && (
            <Text style={styles.calloutText}>Merkez: {earthquake.location_properties.epiCenter.name}</Text>
          )}
          <Text style={styles.detailLink}>Detaylar için tıklayın</Text>
        </View>
      </Callout>
    </Marker>
  );
};

const getMagnitudeColor = (magnitude) => {
  if (magnitude < 4) return '#1db954'; 
  if (magnitude < 5) return '#f4c20d'; 
  return '#db4437'; 
};

const getMarkerSize = (magnitude) => {
  return Math.max(20, Math.min(40, magnitude * 7));
};

const styles = StyleSheet.create({
  markerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
});

export default EarthquakeMarker; 