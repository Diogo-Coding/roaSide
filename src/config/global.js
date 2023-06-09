export default {
  hotels: [
    {
      name: 'Bitácora',
      cif: 'A38033494'
    },
    {
      name: 'Vulcano',
      cif: 'A38033502'
    },
    {
      name: 'Arona Gran',
      cif: 'A38501482'
    }
  ],
  api: {
    getLockRooms: 'http://192.168.50.20:8084/locks/getLockRooms/',
    getRoomTypes: 'http://192.168.50.20:8084/rooms/getRoomTypes/',
    getRoomDetails: 'http://192.168.50.20:8084/rooms/getRoomDetails/',
    getBookedClients: 'http://192.168.50.20:8084/bookings/getBookedClients/',
    getBookings: 'http://192.168.50.20:8084/bookings/getBookings/',
    getThisBooking: 'http://192.168.50.20:8084/bookings/getThisBooking/',
    getRoomStatus: 'http://192.168.50.20:8084/bookings/getRoomStatus/',
    getRoomChange: 'http://192.168.50.20:8084/bookings/getRoomChange/',
    getRoomChangeDetails: 'http://192.168.50.20:8084/bookings/getRoomChangeDetails/',
    getOccupation: 'http://192.168.50.20:8084/bookings/getOccupation/'
  }
}
