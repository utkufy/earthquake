// Deprem toplanma alanları (dummy data)
const emergencyMeetingPoints = [
  {
    id: 1, 
    name: "Şehir Parkı Toplanma Alanı",
    description: "Geniş açık alan, temel ilk yardım ünitesi mevcut",
    coordinate: {
      latitude: 39.9255,
      longitude: 32.8662
    },
    capacity: 5000
  },
  {
    id: 2, 
    name: "Merkez Stadyumu",
    description: "Geniş açık alan, su ve tuvalet imkanları mevcut",
    coordinate: {
      latitude: 41.0370,
      longitude: 28.9856
    },
    capacity: 10000
  },
  {
    id: 3, 
    name: "Okul Bahçesi Toplanma Alanı",
    description: "Orta büyüklükte alan, yakında sağlık ocağı mevcut",
    coordinate: {
      latitude: 38.4237,
      longitude: 27.1428
    },
    capacity: 3000
  },
  {
    id: 4, 
    name: "Belediye Meydanı Toplanma Alanı",
    description: "Şehir merkezinde kolay ulaşılabilir alan",
    coordinate: {
      latitude: 36.8969,
      longitude: 30.7133
    },
    capacity: 7500
  }
];

export default emergencyMeetingPoints; 