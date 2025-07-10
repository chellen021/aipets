import request from './request'

class CheckinService {
  async getCheckinStatus() {
    return request.get('/checkin/status')
  }

  async dailyCheckin() {
    return request.post('/checkin/daily')
  }

  async getCheckinHistory(page = 1, limit = 30) {
    return request.get('/checkin/history', { page, limit })
  }

  async getCheckinRewards() {
    return request.get('/checkin/rewards')
  }
}

export default new CheckinService()
