import { createStoreBindings } from 'mobx-miniprogram-bindings'
import store from '../../store/index'

Page({
  data: {
    userStats: {
      totalCheckins: 0,
      totalPurchases: 0,
      totalInteractions: 0
    }
  },

  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: {
        userInfo: () => store.userStore.userInfo,
        points: () => store.userStore.points,
        level: () => store.userStore.level,
        experience: () => store.userStore.experience,
        checkinStreak: () => store.userStore.checkinStreak,
        currentPet: () => store.petStore.currentPet
      },
      actions: {
        logout: store.userStore.logout
      }
    })

    this.loadUserStats()
  },

  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },

  loadUserStats() {
    const mockStats = {
      totalCheckins: 15,
      totalPurchases: 8,
      totalInteractions: 142
    }
    
    this.setData({
      userStats: mockStats
    })
  },

  onNavigateToOrders() {
    wx.showToast({
      title: '订单记录功能开发中',
      icon: 'none'
    })
  },

  onNavigateToSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    })
  },

  onNavigateToHelp() {
    wx.showToast({
      title: '帮助中心功能开发中',
      icon: 'none'
    })
  },

  onNavigateToAbout() {
    wx.showToast({
      title: '关于我们功能开发中',
      icon: 'none'
    })
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.logout()
        }
      }
    })
  },

  onShareApp() {
    return {
      title: '萌宠伙伴 - AI智能宠物陪伴',
      path: '/pages/auth/login',
      imageUrl: '/assets/images/share-cover.png'
    }
  }
})
