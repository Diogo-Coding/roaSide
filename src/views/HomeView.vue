<template>
  <section class="main-section">
    <nav class="level mb-2">
      <div class="level-left">
        <o-button
          @click="open = true"
          icon-left="bars"
        >
          Abrir menú
        </o-button>
      </div>
      <div class="level-right">
        <o-field
          label="Hotel"
          :horizontal="true"
        >
          <o-select
            v-model="selectedHotel"
            placeholder="Seleccionar hotel"
            @update:model-value="changeHotel"
          >
            <option
              v-for="(hotel, index) in hotels"
              :key="index"
              :value="hotel.cif"
            >
              {{ hotel.name }}
            </option>
          </o-select>
        </o-field>
      </div>
    </nav>
    <FullCalendar
      id="calendar"
      ref="calendar"
      :options="calendarOptions"
    />
  </section>
  <o-sidebar
    :fullheight="true"
    :fullwidth="true"
    :overlay="true"
    :left="true"
    :open="open"
  >
    <o-button
      icon-left="times"
      label="Close"
      @click="open = false"
    />
    <h3>Example</h3>
  </o-sidebar>
  <o-loading
    :full-page="true"
    :active="isLoading"
    :can-cancel="false"
  >
    <o-icon
      pack="fas"
      icon="circle-notch"
      size="large"
      spin
    />
  </o-loading>
  <o-modal
    class="has-text-centered"
    v-model:active="isModalActive"
  >
    <o-datepicker
      inline
      v-model="initialDate"
      :first-day-of-week="1"
      size="medium"
      :max-date="new Date(new Date().setFullYear(new Date().getFullYear() + 2))"
      @update:model-value="changeDate"
    />
  </o-modal>
  <o-modal
    v-model:active="isModalActiveEvent"
  >
    <BookingInfo
      :event-modal-data="eventModalData"
    />
  </o-modal>
</template>

<script>
// Vue
import { ref, reactive, onMounted } from 'vue'
// FullCalendar
import '@fullcalendar/core/vdom'
import FullCalendar from '@fullcalendar/vue3'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import esLocale from '@fullcalendar/core/locales/es'
import interactionPlugin from '@fullcalendar/interaction'
// Libraries
import axios from 'axios'
// Config
import CONFIG from '../config/global.js'
// Components
import BookingInfo from '../components/home/BookingInfo.vue'

export default {
  name: 'HomeView',
  components: {
    FullCalendar,
    BookingInfo
  },
  setup () {
    const calendarResources = reactive([])
    const calendarEvents = reactive([])
    const isLoading = ref(true)
    const roomTypes = ref(null)
    const open = ref(false)
    const hotels = ref(CONFIG.hotels)
    const selectedHotel = ref(hotels.value[0].cif)
    const dateRanges = {
      minDate: null,
      maxDate: null
    }
    const initialDate = reactive(new Date())
    const isModalActive = ref(false)
    const isModalActiveEvent = ref(false)
    const eventModalData = reactive({ eventData: null })
    const calendar = ref(null)

    function changeHotel () {
      isLoading.value = true
      // Vaciar todas las variables
      calendarResources.splice(0)
      calendarEvents.splice(0)
      eventModalData.eventData = null
      // Llamar a carga de reservas, carga de tipos de hab, etc
      loadCalendarResources()
      loadCalendarEvents(dateRanges.minDate.toISOString().split('T')[0], dateRanges.maxDate.toISOString().split('T')[0])
      getOcupationAverages(dateRanges.minDate.toISOString().split('T')[0], dateRanges.maxDate.toISOString().split('T')[0])
    }

    function changeDate (date) {
      calendar.value.getApi().gotoDate(date)
      isModalActive.value = false
    }

    function handleDates (dates) {
      // Si la fecha se encuentra en el rango no llamamos
      if (dateRanges.minDate <= dates.start && dateRanges.maxDate >= dates.end) {
        return
      }

      isLoading.value = true

      dateRanges.minDate = dates.start
      dateRanges.maxDate = dates.end

      loadCalendarEvents(dates.start.toISOString().split('T')[0], dates.end.toISOString().split('T')[0])
      getOcupationAverages(dates.start.toISOString().split('T')[0], dates.end.toISOString().split('T')[0])
    }

    function handleEventClick (event) {
      eventModalData.eventData = event.event.extendedProps
      isModalActiveEvent.value = true
    }

    function loadCalendarResources () {
      axios.get(`http://192.168.50.20:8084/rooms/getRoomDetails/${selectedHotel.value}`).then(res => {
        res.data.forEach(room => {
          calendarResources.push({
            id: room.No_,
            title: `${room.No_} ${room.Type}`,
            roomType: room.Type
          })
        })
      })
    }

    function loadCalendarEvents (startDate, endDate) {
      // Consulta de reservas
      axios.get(`http://192.168.50.20:8084/bookings/getBookings/${selectedHotel.value}/${startDate}/${endDate}`).then(res => {
        const aux = []
        const roomChanges = []
        res.data.forEach(booking => {
          if (booking['Change ID']) {
            roomChanges.push(booking)
            return
          }
          if (booking['Room No_'] === '') return
          // Si es no show no la pintamos
          if (booking.Status === 4 || booking.Status === 5) return
          const backgroundColor = '#009929'

          // check if the event is already in the array
          const eventExists = calendarEvents.some(event => event.id === booking.No_)

          if (!eventExists) {
            const arrivalHour = (booking['Arrival Time'].split('T')[1].split('.')[0] === '00:00:00') ? 14 : parseInt(booking['Arrival Time'].split('T')[1].split('.')[0].split(':')[0])
            const departureHour = (booking['Departure Time'].split('T')[1].split('.')[0] === '00:00:00') ? 12 : parseInt(booking['Departure Time'].split('T')[1].split('.')[0].split(':')[0])
            const arrrivalDate = (new Date(booking['Arrival Date']) < new Date(booking['Check-in Date'])) ? new Date(booking['Check-in Date']) : new Date(booking['Arrival Date'])
            aux.push({
              id: booking.No_,
              title: booking.No_,
              start: new Date(arrrivalDate.setHours(arrivalHour)),
              end: new Date(new Date(booking['Departure Date']).setHours(departureHour)),
              resourceId: booking['Room No_'],
              backgroundColor,
              extendedProps: booking
            })
          }
        })
        calendarEvents.push(...aux)
        if (roomChanges.length > 0) getRoomChanges(roomChanges)
        isLoading.value = false
      })
      // Consultar tambien bloqueos de habitaciones
      axios.get(`http://192.168.50.20:8084/locks/getLockRooms/${selectedHotel.value}/${startDate}/${endDate}`).then(res => {
        const aux = []
        res.data.forEach(lock => {
          // check if the event is already in the array
          const eventExists = calendarEvents.some(event => event.id === lock['Room No_'] + lock['Starting Date'] + lock['Ending Date'])
          if (!eventExists) {
            aux.push({
              id: lock['Room No_'] + lock['Starting Date'] + lock['Ending Date'],
              title: 'Lock: ' + lock.Reason,
              start: lock['Starting Date'],
              end: lock['Ending Date'],
              resourceId: lock['Room No_'],
              // Mirar colores de fondo
              backgroundColor: '#ff6961',
              color: '#ffffff',
              display: 'background',
              extendedProps: lock
            })
          }
        })
        calendarEvents.push(...aux)
      })
    }

    function getRoomChanges (rooms) {
      const promises = []
      rooms.forEach(room => {
        promises.push(axios.get(`http://192.168.50.20:8084/bookings/getRoomChange/${selectedHotel.value}/${room.No_}`))
      })

      Promise.all(promises).then((responses) => {
        const aux = []
        responses.forEach(changes => {
          const fullBooking = rooms.find(r => r.No_ === changes.data[0]['Booking No_'])
          changes.data.forEach(booking => {
            const eventExists = calendarEvents.some(event => event.id === booking['Booking No_'] + 'CHANGED' + booking['Room No_'])

            if (!eventExists) {
              aux.push({
                id: booking['Booking No_'] + 'CHANGED' + booking['Room No_'],
                title: booking['Booking No_'] + 'CHANGED' + booking['Room No_'],
                start: new Date(new Date(booking['Arrival Date']).setHours(14)),
                end: new Date(new Date(booking['Departure Date']).setHours(12)),
                backgroundColor: '#1465bb',
                resourceId: booking['Room No_'],
                extendedProps: fullBooking
              })
            }
          })
        })
        calendarEvents.push(...aux)
      })
    }

    function getOcupationAverages (startDate, endDate) {
      axios.get(`http://192.168.50.20:8084/bookings/getOccupation/${selectedHotel.value}/${startDate}/${endDate}`).then(response => {
        response.data.forEach(occupattion => {
          const element = document.querySelector(`[data-date="${occupattion.Date.split('.')[0]}"] > div > a`)
          if (element) element.innerHTML = `<span class="is-size-7 has-text-grey-light has-text-weight-normal is-pulled-right ml-1 mt-1" alt="${occupattion.POccupation}%">${occupattion.POccupation}%</span>`
        })
      })
    }

    const calendarOptions = {
      plugins: [resourceTimelinePlugin, interactionPlugin],
      initialView: 'resourceTimelineHalfMonth',
      headerToolbar: {
        left: 'resourceTimelineHalfMonth,resourceTimelineFullMonth,resourceTimelineThreeMonth,resourceTimelineOneYear zoom',
        center: 'title',
        right: 'initialDate today prev,next'
      },
      views: {
        resourceTimelineHalfMonth: {
          buttonText: '15 días',
          type: 'resourceTimeline',
          duration: { days: 15 },
          slotDuration: { hours: 12 },
          dayHeaders: true,
          slotLabelFormat: [
            { day: '2-digit', month: '2-digit' }, // top level of text
            { hour: '2-digit' } //
          ]
        },
        resourceTimelineFullMonth: {
          buttonText: 'Mensual',
          type: 'resourceTimeline',
          duration: { days: 30 },
          slotDuration: { hours: 12 },
          dayHeaders: true,
          slotLabelFormat: [
            { day: '2-digit', month: '2-digit' }, // top level of text
            { hour: '2-digit' } //
          ]
        },
        resourceTimelineThreeMonth: {
          buttonText: '3 meses',
          type: 'resourceTimeline',
          duration: { days: 90 },
          slotDuration: { hours: 12 },
          dayHeaders: true,
          slotLabelFormat: [
            { month: 'long', year: 'numeric' },
            { day: '2-digit', month: '2-digit' }, // top level of text
            { hour: '2-digit' } //
          ]
        },
        resourceTimelineOneYear: {
          buttonText: '1 Año',
          type: 'resourceTimeline',
          duration: { days: 365 },
          slotDuration: { hours: 12 },
          dayHeaders: true,
          slotLabelFormat: [
            { month: 'long', year: 'numeric' },
            { day: '2-digit', month: '2-digit' }, // top level of text
            { hour: '2-digit' } //
          ]
        }
      },
      customButtons: {
        zoom: {
          text: 'Añadir/Quitar Zoom',
          click: function () {
            document.getElementsByTagName('table')[0].classList.toggle('zoom')
          }
        },
        initialDate: {
          text: 'Cambiar fecha',
          click: function () {
            isModalActive.value = true
          }
        }
      },
      resourceAreaHeaderContent: 'Habitaciones',
      locale: esLocale,
      editable: true,
      schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
      resources: calendarResources,
      events: calendarEvents,
      datesSet: handleDates,
      resourceAreaWidth: '10%',
      eventDurationEditable: false,
      eventStartEditable: false,
      displayEventTime: false,
      progressiveEventRendering: true,
      initialDate,
      selectable: true,
      eventClick: handleEventClick
    }

    onMounted(() => {
      loadCalendarResources()
    })

    return {
      calendarOptions, calendarResources, calendarEvents, handleDates, loadCalendarEvents, isLoading, initialDate, isModalActive, changeDate, calendar, isModalActiveEvent, eventModalData, hotels, selectedHotel, changeHotel, roomTypes, open
    }
  }

}
</script>

<style>
.fc.fc-media-screen {
 height: calc(100vh - 2.5rem - 72px);
}
.fc-day-sat, .fc-day-sun {
  background-color: rgba(200, 200, 200, 0.2);
}
.footer {
  padding: 2rem !important;
}
.main-section {
  padding: 1rem;
}
.zoom {
  zoom: 50%;
}
</style>
