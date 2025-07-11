import { observable, action } from 'mobx-miniprogram'
import AuthService from '../services/auth.service'

export default class UserStore {
  constructor(rootStore) {
    this.rootStore = rootStore
  }

  @observable userInfo = null
  @observable token = null
  @observable isLoggedIn = false
  @observable points = 0
  @observable level = 1
  @observable experience = 0
  @observable checkinStreak = 0
  @observable lastCheckinDate = null

  @action
  setToken(token) {
    this.token = token
    this.isLoggedIn = !!token
    if (token) {
      wx.setStorageSync('token', token)
    } else {
      wx.removeStorageSync('token')
    }
  }

  @action
  setUserInfo(userInfo) {
    this.userInfo = userInfo
    this.points = userInfo.points || 0
    this.level = userInfo.level || 1
    this.experience = userInfo.experience || 0
    this.checkinStreak = userInfo.checkinStreak || 0
    this.lastCheckinDate = userInfo.lastCheckinDate
  }

  @action
  async login(code) {
    try {
      this.rootStore.uiStore.setLoading(true)
      const response = await AuthService.login(code)
      this.setToken(response.token)
      this.setUserInfo(response.userInfo)
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      this.rootStore.uiStore.setLoading(false)
    }
  }

  @action
  async getUserInfo() {
    try {
      const response = await AuthService.getUserInfo()
      this.setUserInfo(response)
      return response
    } catch (error) {
      console.error('Get user info failed:', error)
      this.logout()
      throw error
    }
  }

  @action
  logout() {
    this.setToken(null)
    this.setUserInfo(null)
    wx.reLaunch({
      url: '/pages/auth/login'
    })
  }

  @action
  updatePoints(points) {
    this.points = points
  }

  @action
  updateLevel(level, experience) {
    this.level = level
    this.experience = experience
  }

  @action
  updateCheckinStreak(streak, date) {
    this.checkinStreak = streak
    this.lastCheckinDate = date
  }
}
