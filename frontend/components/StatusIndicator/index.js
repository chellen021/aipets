Component({
  properties: {
    status: {
      type: Object,
      value: {
        mood: 100,
        hunger: 100,
        cleanliness: 100,
        affection: 100,
        experience: 0,
        level: 1
      }
    },
    showLabels: {
      type: Boolean,
      value: true
    },
    compact: {
      type: Boolean,
      value: false
    }
  },

  data: {
    statusConfig: {
      mood: { label: '心情', icon: '😊', color: '#FF9966' },
      hunger: { label: '饥饿', icon: '🍎', color: '#52C41A' },
      cleanliness: { label: '清洁', icon: '🧼', color: '#13C2C2' },
      affection: { label: '亲密', icon: '❤️', color: '#FF4D4F' },
      experience: { label: '经验', icon: '⭐', color: '#FAAD14' }
    }
  },

  methods: {
    getStatusColor(value) {
      if (value >= 80) return '#52C41A'
      if (value >= 60) return '#FAAD14'
      if (value >= 40) return '#FF9966'
      return '#FF4D4F'
    },

    getStatusText(key, value) {
      if (key === 'experience') {
        return `${value}/100`
      }
      return `${value}%`
    }
  }
})
