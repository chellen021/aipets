import { createStoreBindings } from 'mobx-miniprogram-bindings'
import store from '../../store/index'
import CheckinService from '../../services/checkin.service'

Page({
  data: {
    checkinData: [],
    todayCheckedIn: false,
    checkinStreak: 0,
    totalPoints: 0,
    isChecking: false
  },

  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: {
        userInfo: () => store.userStore.userInfo,
        points: () => store.userStore.points,
        streak: () => store.userStore.checkinStreak
      },
      actions: {
        updatePoints: store.userStore.updatePoints,
        updateCheckinStreak: store.userStore.updateCheckinStreak
      }
    })

    this.loadCheckinData()
  },

  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },

  async loadCheckinData() {
    try {
      const [statusRes, historyRes] = await Promise.all([
        CheckinService.getCheckinStatus(),
        CheckinService.getCheckinHistory()
      ])

      this.setData({
        todayCheckedIn: statusRes.todayCheckedIn,
        checkinStreak: statusRes.streak,
        totalPoints: statusRes.totalPoints,
        checkinData: historyRes.history
      })
    } catch (error) {
      console.error('Load checkin data failed:', error)
      wx.showToast({
        title: '加载签到数据失败',
        icon: 'none'
      })
    }
  },

  async onDailyCheckin() {
    if (this.data.todayCheckedIn || this.data.isChecking) {
      return
    }

    try {
      this.setData({ isChecking: true })
      
      const result = await CheckinService.dailyCheckin()
      
      this.setData({
        todayCheckedIn: true,
        checkinStreak: result.streak,
        totalPoints: result.totalPoints
      })

      this.updatePoints(result.totalPoints)
      this.updateCheckinStreak(result.streak, result.checkinDate)

      wx.showToast({
        title: `签到成功！获得${result.points}积分`,
        icon: 'success'
      })

      this.loadCheckinData()
    } catch (error) {
      console.error('Daily checkin failed:', error)
      wx.showToast({
        title: error.message || '签到失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ isChecking: false })
    }
  },

  onCalendarCheckin(e) {
    const { date } = e.detail
    const today = new Date().toISOString().split('T')[0]
    
    if (date === today && !this.data.todayCheckedIn) {
      this.onDailyCheckin()
    }
  }
})
