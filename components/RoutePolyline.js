import React from 'react';
import { Polyline } from 'react-native-maps';

const RoutePolyline = ({ coordinates }) => {
  if (!coordinates || coordinates.length < 2) return null;
  
  return (
    <Polyline
      coordinates={coordinates}
      strokeWidth={4}
      strokeColor="#1db954"
      lineDashPattern={[0]}
    />
  );
};

export default RoutePolyline; 