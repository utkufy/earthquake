import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

const DirectionsModal = ({ visible, meetingPoint, directions, onClose, onClearRoute }) => {
  if (!meetingPoint) return null;
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yol Tarifi</Text>
            <Text style={styles.modalSubtitle}>{meetingPoint.name}</Text>
          </View>
          
          <View style={styles.directionsContainer}>
            {directions.map((direction, index) => (
              <View key={index} style={styles.directionItem}>
                <View style={styles.directionNumberContainer}>
                  <Text style={styles.directionNumber}>{direction.step}</Text>
                </View>
                <Text style={styles.directionText}>{direction.instruction}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.closeButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Kapat</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.clearButton]} 
              onPress={onClearRoute}
            >
              <Text style={styles.buttonText}>Rotayı Temizle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default DirectionsModal; 