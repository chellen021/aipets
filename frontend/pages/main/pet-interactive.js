import { createStoreBindings } from 'mobx-miniprogram-bindings'
import store from '../../store/index'

Page({
  data: {
    interactionCooldowns: {},
    showStatusDetail: false
  },

  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: {
        currentPet: () => store.petStore.currentPet,
        userInfo: () => store.userStore.userInfo,
        isLoading: () => store.uiStore.isLoading
      },
      actions: {
        interactWithPet: store.petStore.interactWithPet,
        getPetList: store.petStore.getPetList
      }
    })

    this.loadPetData()
  },

  onShow() {
    if (this.data.currentPet) {
      store.petStore.startStatusDecay()
    }
  },

  onHide() {
    store.petStore.stopStatusDecay()
  },

  onUnload() {
    this.storeBindings.destroyStoreBindings()
    store.petStore.stopStatusDecay()
  },

  async loadPetData() {
    try {
      await this.getPetList()
      if (!this.data.currentPet) {
        wx.redirectTo({
          url: '/pages/pet-generation/upload'
        })
      }
    } catch (error) {
      console.error('Load pet data failed:', error)
    }
  },

  async onPetInteraction(e) {
    const { type } = e.detail
    
    if (this.data.interactionCooldowns[type] > 0) {
      wx.showToast({
        title: '操作冷却中，请稍后再试',
        icon: 'none'
      })
      return
    }

    try {
      await this.interactWithPet(type)
      
      this.startCooldown(type)
      
      wx.showToast({
        title: this.getInteractionSuccessMessage(type),
        icon: 'success'
      })
    } catch (error) {
      console.error('Pet interaction failed:', error)
      wx.showToast({
        title: error.message || '互动失败，请重试',
        icon: 'none'
      })
    }
  },

  getInteractionSuccessMessage(type) {
    const messages = {
      feed: '喂食成功！宠物很开心',
      pet: '抚摸成功！宠物感到温暖',
      play: '玩耍成功！宠物很兴奋',
      clean: '清洁成功！宠物变得干净',
      train: '训练成功！宠物获得经验'
    }
    return messages[type] || '互动成功！'
  },

  startCooldown(type) {
    const cooldownTimes = {
      feed: 3600,
      pet: 1800,
      play: 7200,
      clean: 14400,
      train: 21600
    }
    
    const cooldownTime = cooldownTimes[type] || 3600
    this.setData({
      [`interactionCooldowns.${type}`]: cooldownTime
    })
    
    const timer = setInterval(() => {
      const remaining = this.data.interactionCooldowns[type] - 1
      if (remaining <= 0) {
        clearInterval(timer)
        this.setData({
          [`interactionCooldowns.${type}`]: 0
        })
      } else {
        this.setData({
          [`interactionCooldowns.${type}`]: remaining
        })
      }
    }, 1000)
  },

  onPetTouch(e) {
    const { pet, touch } = e.detail
    
    wx.vibrateShort()
    
    this.triggerPetAnimation('happy')
  },

  triggerPetAnimation(animationType) {
    const petDisplay = this.selectComponent('#pet-display')
    if (petDisplay) {
      petDisplay.playAnimation(animationType)
    }
  },

  onToggleStatusDetail() {
    this.setData({
      showStatusDetail: !this.data.showStatusDetail
    })
  },

  onNavigateToMall() {
    wx.switchTab({
      url: '/pages/mall/index'
    })
  },

  onNavigateToProfile() {
    wx.switchTab({
      url: '/pages/profile/index'
    })
  }
})
