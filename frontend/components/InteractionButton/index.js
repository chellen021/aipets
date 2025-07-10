Component({
  properties: {
    type: {
      type: String,
      value: 'feed'
    },
    disabled: {
      type: Boolean,
      value: false
    },
    cooldown: {
      type: Number,
      value: 0
    }
  },

  data: {
    icons: {
      feed: '🍎',
      pet: '👋',
      play: '🎾',
      clean: '🧼',
      train: '📚'
    },
    labels: {
      feed: '喂食',
      pet: '抚摸',
      play: '玩耍',
      clean: '清洁',
      train: '训练'
    },
    cooldownTimer: null,
    remainingTime: 0
  },

  lifetimes: {
    attached() {
      if (this.properties.cooldown > 0) {
        this.startCooldown()
      }
    },

    detached() {
      if (this.data.cooldownTimer) {
        clearInterval(this.data.cooldownTimer)
      }
    }
  },

  observers: {
    'cooldown'(newCooldown) {
      if (newCooldown > 0) {
        this.startCooldown()
      } else {
        this.stopCooldown()
      }
    }
  },

  methods: {
    onTap() {
      if (this.properties.disabled || this.data.remainingTime > 0) {
        return
      }

      this.triggerEvent('interact', {
        type: this.properties.type
      })

      this.playClickAnimation()
    },

    playClickAnimation() {
      this.setData({
        animating: true
      })

      setTimeout(() => {
        this.setData({
          animating: false
        })
      }, 300)
    },

    startCooldown() {
      this.setData({
        remainingTime: this.properties.cooldown
      })

      this.data.cooldownTimer = setInterval(() => {
        const remaining = this.data.remainingTime - 1
        this.setData({
          remainingTime: Math.max(0, remaining)
        })

        if (remaining <= 0) {
          this.stopCooldown()
        }
      }, 1000)
    },

    stopCooldown() {
      if (this.data.cooldownTimer) {
        clearInterval(this.data.cooldownTimer)
        this.data.cooldownTimer = null
      }
      this.setData({
        remainingTime: 0
      })
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }
})
