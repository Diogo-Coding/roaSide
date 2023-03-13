<template>
  <div class="box">
    <div class="content">
      <h1>{{ eventModalData.eventData.No_ }}  - {{ eventModalData.eventData['Room No_'] }}</h1>
      <ul>
        <li><strong>Num Reserva: </strong>{{ eventModalData.eventData.No_ }}</li>
        <li><strong>Habitación: </strong>{{ eventModalData.eventData['Room No_'] }}</li>
        <li><strong>Nombre Cliente: </strong>{{ eventModalData.eventData.Name }}</li>
        <li><strong>Llegada: </strong>{{ new Date(eventModalData.eventData['Arrival Date']).toLocaleDateString() }}</li>
        <li><strong>Salida: </strong>{{ new Date(eventModalData.eventData['Departure Date']).toLocaleDateString() }}</li>
        <li><strong>Régimen: </strong>{{ eventModalData.eventData['Board Basis'] }}</li>
        <li><strong>Pax (adultos + niños): </strong>{{ eventModalData.eventData['Total Pax'] - eventModalData.eventData.Children }} / {{ eventModalData.eventData.Children }} </li>
        <li><strong>Status: </strong>{{ eventModalData.eventData.Status }}</li>
        <li><strong>Tipo de habitación (Reservada/Asignada): </strong>{{ eventModalData.eventData['Booked Room Type'] }} / {{ eventModalData.eventData['Assigned Room Type'] }}</li>
        <li><strong>Voucher: </strong>{{ eventModalData.eventData.Voucher }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookingInfo',
  props: {
    eventModalData: {
      type: Object,
      required: true
    }
  }
}
</script>
