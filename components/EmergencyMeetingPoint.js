import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EmergencyMeetingPoint = ({ point, onSelect }) => {
  return (
    <Marker
      key={point.id}
      coordinate={point.coordinate}
      title={point.name}
      description={point.description}
      onPress={() => onSelect(point)}
    >
      <View style={styles.meetingPointMarker}>
        <MaterialCommunityIcons name="flag-outline" size={26} color="#ffffff" />
      </View>
      
      <Callout tooltip>
        <View style={styles.meetingPointCallout}>
          <Text style={styles.meetingPointTitle}>{point.name}</Text>
          <Text style={styles.meetingPointDescription}>{point.description}</Text>
          <Text style={styles.meetingPointCapacity}>Kapasite: {point.capacity} kişi</Text>
          <Text style={styles.meetingPointDirections}>Yol tarifi için tıklayın</Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
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
});

export default EmergencyMeetingPoint; 