import { createStoreBindings } from 'mobx-miniprogram-bindings'
import store from '../../store/index'

Page({
  data: {
    selectedImage: null,
    isUploading: false,
    uploadProgress: 0
  },

  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store: store.petStore,
      fields: ['isGenerating'],
      actions: ['generatePet']
    })
  },

  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },

  onChooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.setData({
          selectedImage: tempFilePath
        })
      },
      fail: (error) => {
        console.error('Choose image failed:', error)
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  },

  onRemoveImage() {
    this.setData({
      selectedImage: null
    })
  },

  async onUploadAndGenerate() {
    if (!this.data.selectedImage) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ isUploading: true })
      
      const imageUrl = await this.uploadImage(this.data.selectedImage)
      
      wx.navigateTo({
        url: `/pages/pet-generation/confirm?imageUrl=${encodeURIComponent(imageUrl)}`
      })
    } catch (error) {
      console.error('Upload failed:', error)
      wx.showToast({
        title: '上传失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ isUploading: false })
    }
  },

  uploadImage(filePath) {
    return new Promise((resolve, reject) => {
      const uploadTask = wx.uploadFile({
        url: `${getApp().globalData.baseUrl}/upload`,
        filePath,
        name: 'image',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0) {
              resolve(data.data.url)
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (error) {
            reject(new Error('上传响应解析失败'))
          }
        },
        fail: reject
      })

      uploadTask.onProgressUpdate((res) => {
        this.setData({
          uploadProgress: res.progress
        })
      })
    })
  },

  onTakePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.setData({
          selectedImage: tempFilePath
        })
      }
    })
  },

  onChooseFromAlbum() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.setData({
          selectedImage: tempFilePath
        })
      }
    })
  }
})
