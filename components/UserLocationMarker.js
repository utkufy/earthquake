import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';

const UserLocationMarker = ({ coordinate }) => {
  if (!coordinate) return null;
  
  return (
    <Marker
      coordinate={coordinate}
      title="Konumunuz"
      pinColor="#1db954"
    >
      <View style={styles.userMarker}>
        <View style={styles.userMarkerInner} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
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
});

export default UserLocationMarker; 