import { observable, configure } from 'mobx-miniprogram'
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import store from './store/index'

configure({ enforceActions: 'never' })

App({
  onLaunch() {
    this.initStore()
    this.checkAuth()
  },

  initStore() {
    this.store = store
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ['userInfo', 'isLoggedIn', 'currentPet'],
      actions: ['login', 'logout', 'updateUserInfo']
    })
  },

  checkAuth() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.store.userStore.setToken(token)
      this.store.userStore.getUserInfo()
    } else {
      wx.reLaunch({
        url: '/pages/auth/login'
      })
    }
  },

  onShow() {
    if (this.store && this.store.petStore.currentPet) {
      this.store.petStore.startStatusDecay()
    }
  },

  onHide() {
    if (this.store && this.store.petStore.currentPet) {
      this.store.petStore.stopStatusDecay()
    }
  },

  globalData: {
    baseUrl: 'https://api.aipets.com',
    version: '1.0.0'
  }
})
