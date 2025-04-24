import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RouteInfoBar = ({ meetingPoint, onDirectionsPress, onClearRoute }) => {
  if (!meetingPoint) return null;
  
  return (
    <View style={styles.routeInfoBar}>
      <View style={styles.routeInfoContent}>
        <Text style={styles.routeInfoText}>
          {meetingPoint.name}
        </Text>
        <TouchableOpacity 
          style={styles.directionsButton}
          onPress={onDirectionsPress}
        >
          <Text style={styles.directionsButtonText}>Yol Tarifi</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.closeRouteButton}
        onPress={onClearRoute}
      >
        <MaterialCommunityIcons name="close" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default RouteInfoBar; 