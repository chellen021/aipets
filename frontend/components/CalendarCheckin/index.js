Component({
  properties: {
    checkinData: {
      type: Array,
      value: []
    },
    currentStreak: {
      type: Number,
      value: 0
    }
  },

  data: {
    currentDate: new Date(),
    calendarDays: [],
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  },

  lifetimes: {
    attached() {
      this.generateCalendar()
    }
  },

  observers: {
    'checkinData'() {
      this.generateCalendar()
    }
  },

  methods: {
    generateCalendar() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      const days = []
      const checkinMap = {}
      
      this.properties.checkinData.forEach(item => {
        checkinMap[item.date] = item
      })
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        const dateStr = this.formatDate(date)
        const isCurrentMonth = date.getMonth() === month
        const isToday = this.isToday(date)
        const checkinInfo = checkinMap[dateStr]
        
        days.push({
          date: date.getDate(),
          dateStr,
          isCurrentMonth,
          isToday,
          isCheckedIn: !!checkinInfo,
          points: checkinInfo ? checkinInfo.points : 0,
          isWeekend: date.getDay() === 0 || date.getDay() === 6
        })
      }
      
      this.setData({
        calendarDays: days,
        currentMonth: this.data.monthNames[month],
        currentYear: year
      })
    },

    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    isToday(date) {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    },

    onDayTap(e) {
      const { day } = e.currentTarget.dataset
      if (day.isToday && !day.isCheckedIn) {
        this.triggerEvent('checkin', { date: day.dateStr })
      }
    },

    prevMonth() {
      const newDate = new Date(this.data.currentDate)
      newDate.setMonth(newDate.getMonth() - 1)
      this.setData({ currentDate: newDate })
      this.generateCalendar()
    },

    nextMonth() {
      const newDate = new Date(this.data.currentDate)
      newDate.setMonth(newDate.getMonth() + 1)
      this.setData({ currentDate: newDate })
      this.generateCalendar()
    }
  }
})
