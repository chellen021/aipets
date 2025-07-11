const app = getApp()

class Request {
  constructor() {
    this.baseURL = app.globalData.baseUrl
    this.timeout = 10000
  }

  request(options) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token')
      
      wx.request({
        url: `${this.baseURL}${options.url}`,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.header
        },
        timeout: this.timeout,
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.code === 0) {
              resolve(res.data.data)
            } else {
              this.handleError(res.data)
              reject(new Error(res.data.message || '请求失败'))
            }
          } else if (res.statusCode === 401) {
            this.handleUnauthorized()
            reject(new Error('登录已过期'))
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          console.error('Request failed:', error)
          reject(new Error('网络请求失败'))
        }
      })
    })
  }

  get(url, data, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    })
  }

  post(url, data, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    })
  }

  put(url, data, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  }

  delete(url, data, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }

  handleError(data) {
    wx.showToast({
      title: data.message || '请求失败',
      icon: 'none',
      duration: 2000
    })
  }

  handleUnauthorized() {
    wx.removeStorageSync('token')
    wx.reLaunch({
      url: '/pages/auth/login'
    })
  }

  uploadFile(filePath, name = 'file', formData = {}) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token')
      
      wx.uploadFile({
        url: `${this.baseURL}/upload`,
        filePath,
        name,
        formData,
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0) {
              resolve(data.data)
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (error) {
            reject(new Error('上传响应解析失败'))
          }
        },
        fail: (error) => {
          console.error('Upload failed:', error)
          reject(new Error('上传失败'))
        }
      })
    })
  }
}

export default new Request()
