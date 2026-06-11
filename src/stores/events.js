import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import eventsData from '@/data/events.json'
import directionEventsData from '@/data/direction_events.json'

export const useEventsStore = defineStore('events', () => {
  const events = ref(eventsData.events || [])
  const directionEvents = ref(directionEventsData || {})
  const currentEvent = ref(null)
  const isLoading = ref(false)

  const availableEvents = computed(() => {
    return events.value
  })

  async function loadEvents() {
    isLoading.value = false
    console.log('Events loaded:', events.value.length, 'general events')
    console.log('Direction events loaded:', Object.keys(directionEvents.value).length, 'directions')
  }

  function getRandomEvent(direction = null) {
    console.log('getRandomEvent called, direction:', direction)
    
    let allEvents = [...events.value]
    
    if (direction && directionEvents.value[direction]) {
      allEvents = allEvents.concat(directionEvents.value[direction])
    }

    console.log('Total events available:', allEvents.length)
    
    if (allEvents.length === 0) {
      console.warn('No events available')
      return null
    }

    const randomIndex = Math.floor(Math.random() * allEvents.length)
    currentEvent.value = allEvents[randomIndex]
    console.log('Selected event:', currentEvent.value?.title || 'None')
    return currentEvent.value
  }

  function setCurrentEvent(event) {
    currentEvent.value = event
  }

  function resetEvents() {
    currentEvent.value = null
  }

  return {
    events,
    directionEvents,
    currentEvent,
    isLoading,
    availableEvents,
    loadEvents,
    getRandomEvent,
    setCurrentEvent,
    resetEvents
  }
})
