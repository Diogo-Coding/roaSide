<template>
  <section class="main-section">
    <FullCalendar
      id="calendar"
      :options="calendarOptions"
    />
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
  </section>
</template>

<script>
import '@fullcalendar/core/vdom'
import FullCalendar from '@fullcalendar/vue3'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import esLocale from '@fullcalendar/core/locales/es'
import interactionPlugin from '@fullcalendar/interaction'
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'HomeView',
  components: {
    FullCalendar
  },
  setup () {
    const calendarResources = reactive([])
    const calendarEvents = reactive([])
    const isLoading = ref(true)
    const dateRanges = {
      minDate: new Date(),
      maxDate: new Date()
    }

    function handleDates (dates) {
      // Si la fecha se encuentra en el rango no llamamos
      if (dateRanges.minDate <= dates.start && dateRanges.maxDate >= dates.end) {
        return
      }

      isLoading.value = true

      dateRanges.minDate = (dateRanges.minDate > dates.start) ? dates.start : dateRanges.minDate
      dateRanges.maxDate = (dateRanges.maxDate < dates.end) ? dates.end : dateRanges.maxDate

      loadCalendarEvents(dates.start.toISOString().split('T')[0], dates.end.toISOString().split('T')[0])
    }

    function loadCalendarResources () {
      axios.get('http://192.168.50.20:8083/getRoomDetails/A38033494').then(res => {
        res.data.forEach(room => {
          calendarResources.push({
            id: room.No_,
            title: room.No_
          })
        })
      })
    }

    function loadCalendarEvents (startDate, endDate) {
      // Consulta de reservas
      axios.get(`http://192.168.50.20:8083/getBookings/A38033494/${startDate}/${endDate}`).then(res => {
        const aux = []
        res.data.forEach(booking => {
          if (booking['Room No_'] === '') return
          // check if the event is already in the array
          const eventExists = calendarEvents.some(event => event.id === booking.No_)

          if (!eventExists) {
            aux.push({
              id: booking.No_,
              title: booking.No_,
              start: new Date(new Date(booking['Arrival Date']).setHours(14)),
              end: new Date(new Date(booking['Departure Date']).setHours(12)),
              resourceId: booking['Room No_']
            })
          }
        })
        calendarEvents.push(...aux)
        isLoading.value = false
      })
      // Consultar tambien bloqueos de habitaciones
      axios.get(`http://192.168.50.20:8083/getLockRooms/A38033494/${startDate}/${endDate}`).then(res => {
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
              backgroundColor: '#ff0000'
            })
          }
        })
        calendarEvents.push(...aux)
      })
    }

    const calendarOptions = {
      plugins: [resourceTimelinePlugin, interactionPlugin],
      initialView: 'resourceTimelineHalfMonth',
      headerToolbar: {
        left: 'resourceTimelineHalfMonth,resourceTimelineFullMonth,resourceTimelineThreeMonth,resourceTimelineOneYear zoom',
        center: 'title',
        right: 'today prev,next'
      },
      views: {
        resourceTimelineHalfMonth: {
          buttonText: '15 días',
          type: 'resourceTimeline',
          duration: { days: 15 },
          slotDuration: { days: 1 },
          dayHeaders: true
        },
        resourceTimelineFullMonth: {
          buttonText: 'Mensual',
          type: 'resourceTimeline',
          duration: { days: 30 },
          slotDuration: { days: 1 },
          dayHeaders: true
        },
        resourceTimelineThreeMonth: {
          buttonText: '3 meses',
          type: 'resourceTimeline',
          duration: { days: 90 },
          slotDuration: { days: 1 },
          dayHeaders: true
        },
        resourceTimelineOneYear: {
          buttonText: '1 Año',
          type: 'resourceTimeline',
          duration: { days: 365 },
          slotDuration: { days: 1 },
          dayHeaders: true
        }
      },
      customButtons: {
        zoom: {
          text: 'Añadir/Quitar Zoom',
          click: function () {
            document.getElementsByTagName('table')[0].classList.toggle('zoom')
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
      progressiveEventRendering: true
    }

    onMounted(() => {
      loadCalendarResources()
    })

    return {
      calendarOptions, calendarResources, calendarEvents, handleDates, loadCalendarResources, loadCalendarEvents, isLoading
    }
  }

}
</script>

<style>
.fc.fc-media-screen {
 height: calc(100vh - 2rem);
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
