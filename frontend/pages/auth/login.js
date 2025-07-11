import { createStoreBindings } from 'mobx-miniprogram-bindings'
import store from '../../store/index'

Page({
  data: {
    canIUseGetUserProfile: false,
    isLoading: false
  },

  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: store.userStore,
      fields: ['isLoggedIn'],
      actions: ['login']
    })

    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }

    if (this.data.isLoggedIn) {
      this.redirectToMain()
    }
  },

  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },

  async onWeChatLogin() {
    try {
      this.setData({ isLoading: true })

      const loginRes = await this.wxLogin()
      const userProfileRes = await this.wxGetUserProfile()
      
      await this.login({
        code: loginRes.code,
        userInfo: userProfileRes.userInfo
      })

      this.redirectToMain()
    } catch (error) {
      console.error('Login failed:', error)
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      })
    })
  },

  wxGetUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: resolve,
        fail: reject
      })
    })
  },

  redirectToMain() {
    wx.switchTab({
      url: '/pages/main/pet-interactive'
    })
  }
})
