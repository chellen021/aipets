import { createStoreBindings } from 'mobx-miniprogram-bindings'
import store from '../../store/index'

Page({
  data: {
    imageUrl: '',
    petName: '',
    isGenerating: false,
    nameError: ''
  },

  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store: store.petStore,
      fields: ['isGenerating'],
      actions: ['generatePet']
    })

    if (options.imageUrl) {
      this.setData({
        imageUrl: decodeURIComponent(options.imageUrl)
      })
    }
  },

  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },

  onNameInput(e) {
    const petName = e.detail.value
    this.setData({
      petName,
      nameError: ''
    })
  },

  validatePetName(name) {
    if (!name || name.trim() === '') {
      return '宠物名称不能为空'
    }
    if (name.length < 2) {
      return '宠物名称至少需要2个字符'
    }
    if (name.length > 10) {
      return '宠物名称最多10个字符'
    }
    if (/[^\u4e00-\u9fa5a-zA-Z0-9]/.test(name)) {
      return '宠物名称只能包含中文、英文和数字'
    }
    return null
  },

  async onConfirmGenerate() {
    const nameError = this.validatePetName(this.data.petName)
    if (nameError) {
      this.setData({ nameError })
      return
    }

    try {
      this.setData({ isGenerating: true })
      
      await this.generatePet(this.data.imageUrl, this.data.petName.trim())
      
      wx.showToast({
        title: '宠物生成成功！',
        icon: 'success'
      })

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/main/pet-interactive'
        })
      }, 1500)
    } catch (error) {
      console.error('Generate pet failed:', error)
      wx.showToast({
        title: error.message || '生成失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ isGenerating: false })
    }
  },

  onRetakePhoto() {
    wx.navigateBack()
  },

  onRandomName() {
    const randomNames = [
      '小可爱', '毛球球', '萌萌哒', '小天使', '糖果',
      '布丁', '奶茶', '棉花糖', '小星星', '彩虹',
      '小太阳', '月亮', '雪花', '樱花', '小精灵'
    ]
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)]
    this.setData({
      petName: randomName,
      nameError: ''
    })
  }
})
