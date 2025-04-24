export const generateSimulatedRoute = (startLocation, endLocation) => {
  if (!startLocation || !endLocation) return [];

  
  const numPoints = 8;
  const simulatedRoute = [startLocation];
  
  for (let i = 1; i < numPoints; i++) {
    const ratio = i / numPoints;
    const latOffset = (Math.random() * 0.005) - 0.0025;
    const lngOffset = (Math.random() * 0.005) - 0.0025;
    
    simulatedRoute.push({
      latitude: startLocation.latitude + (endLocation.latitude - startLocation.latitude) * ratio + latOffset,
      longitude: startLocation.longitude + (endLocation.longitude - startLocation.longitude) * ratio + lngOffset
    });
  }
  
  simulatedRoute.push(endLocation);
  return simulatedRoute;
};

export const generateSimulatedDirections = (destinationName) => {
  const directions = [
    { step: 1, instruction: "Bulunduğunuz yerden kuzeye doğru 1.2 km ilerleyin" },
    { step: 2, instruction: "Sağa dönün ve 800 metre devam edin" },
    { step: 3, instruction: "Kavşakta sola dönün" },
    { step: 4, instruction: "2.5 km düz devam edin" },
    { step: 5, instruction: `${destinationName}'na vardınız` },
  ];
  
  return directions;
}; 