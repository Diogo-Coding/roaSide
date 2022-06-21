<template>
  <section class="section">
    <FullCalendar
      ref="calendarApi"
      :options="calendarOptions"
    />
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
    const startDate = ref(null)
    const endDate = ref(null)

    function handleDates (dates) {
      if (startDate.value === dates.start.toISOString().split('T')[0] && endDate.value === dates.end.toISOString().split('T')[0]) {
        return
      }
      startDate.value = dates.start.toISOString().split('T')[0]
      endDate.value = dates.end.toISOString().split('T')[0]
      loadCalendarEvents(dates.start.toISOString().split('T')[0], dates.end.toISOString().split('T')[0])
    }

    function loadCalendarResources () {
      axios.get('http://192.168.50.20:8083/getRoomDetails/A38033502').then(res => {
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
      axios.get(`http://192.168.50.20:8083/getBookings/A38033502/${startDate}/${endDate}`).then(res => {
        res.data.forEach(booking => {
          // check if the event is already in the array
          let eventExists = false
          calendarEvents.forEach(event => {
            if (event.id === booking.No_) {
              eventExists = true
            }
          })
          if (!eventExists) {
            calendarEvents.push({
              id: booking.No_,
              title: booking.No_,
              start: booking['Arrival Date'],
              end: booking['Departure Date'],
              resourceId: booking['Room No_']
            })
          }
        })
      })
      // Consultar tambien bloqueos de habitaciones
      axios.get(`http://192.168.50.20:8083/getLockRooms/A38033502/${startDate}/${endDate}`).then(res => {
        res.data.forEach(lock => {
          // check if the event is already in the array
          let eventExists = false
          calendarEvents.forEach(event => {
            if (event.id === lock['Room No_'] + lock['Starting Date'] + lock['Ending Date']) {
              eventExists = true
            }
          })
          if (!eventExists) {
            calendarEvents.push({
              id: lock['Room No_'] + lock['Starting Date'] + lock['Ending Date'],
              title: 'Lock: ' + lock.Reason,
              start: lock['Starting Date'],
              end: lock['Ending Date'],
              resourceId: lock['Room No_'],
              backgroundColor: '#ff0000'
            })
          }
        })
      })
    }

    const calendarOptions = {
      plugins: [resourceTimelinePlugin, interactionPlugin],
      initialView: 'resourceTimelineHalfMonth',
      views: {
        resourceTimelineHalfMonth: {
          type: 'resourceTimeline',
          duration: { days: 30 },
          slotDuration: { days: 1 },
          dayHeaders: true
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
      eventOverlap: function (stillEvent, movingEvent) {
        // ver como hacer para que no se puedan solapar eventos, solo si coincide el ultimo y primer dia de la reserva
        return true
      }
    }

    onMounted(() => {
      loadCalendarResources()
    })

    return {
      calendarOptions, calendarResources, calendarEvents, handleDates, loadCalendarResources, loadCalendarEvents, startDate, endDate
    }
  }

}
</script>

<style>
.fc.fc-media-screen {
 height: calc(100vh - 76px - 10rem);
}
.fc-day-sat, .fc-day-sun {
  background-color: rgba(200, 200, 200, 0.2);
}
.footer {
  padding: 2rem !important;
}
</style>
