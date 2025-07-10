import request from './request'

class AuthService {
  async login(code) {
    return request.post('/auth/login', { code })
  }

  async getUserInfo() {
    return request.get('/auth/userinfo')
  }

  async updateUserInfo(userInfo) {
    return request.put('/auth/userinfo', userInfo)
  }

  async bindPhone(phoneCode) {
    return request.post('/auth/bind-phone', { phoneCode })
  }
}

export default new AuthService()
