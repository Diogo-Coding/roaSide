<template>
  <section class="section">
    <div class="container">
      <FullCalendar :options="calendarOptions" />
    </div>
  </section>
</template>

<script>
import '@fullcalendar/core/vdom' // solves problem with Vite
import FullCalendar from '@fullcalendar/vue3'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import esLocale from '@fullcalendar/core/locales/es'
import interactionPlugin from '@fullcalendar/interaction'
// import { onBeforeMount } from 'vue'
import { reactive } from '@vue/reactivity'
// import axios from 'axios'
import { bookings, rooms } from '../common/data.js'

export default {
  name: 'HomeView',
  components: {
    FullCalendar
  },
  setup () {
    const calendarResources = reactive(rooms.map(room => ({
      id: room.No_,
      title: room.No_
    })))
    const calendarEvents = reactive(bookings.map(booking => ({
      id: booking.No_,
      title: booking.No_,
      start: booking['Arrival Date'],
      end: booking['Departure Date'],
      resourceId: booking['Room No_']
    })))
    console.log(calendarEvents)
    const calendarOptions = {
      plugins: [resourceTimelinePlugin, interactionPlugin],
      initialView: 'resourceTimelineHalfMonth',
      views: {
        resourceTimelineHalfMonth: {
          type: 'resourceTimeline',
          duration: { days: 15 },
          slotDuration: { days: 1 },
          dayHeaders: true
        }
      },
      resourceAreaHeaderContent: 'Habitaciones',
      locale: esLocale,
      editable: true,
      schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
      resources: calendarResources,
      events: calendarEvents
    }

    return {
      calendarOptions, calendarResources, calendarEvents
    }
  }

}
</script>
