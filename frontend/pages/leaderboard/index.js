import { createStoreBindings } from 'mobx-miniprogram-bindings'
import store from '../../store/index'

Page({
  data: {
    currentTab: 'points',
    pointsRanking: [],
    levelRanking: [],
    petRanking: [],
    myRanking: null,
    isLoading: false
  },

  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: {
        userInfo: () => store.userStore.userInfo
      }
    })

    this.loadRankingData()
  },

  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },

  async loadRankingData() {
    try {
      this.setData({ isLoading: true })
      
      const [pointsRes, levelRes, petRes] = await Promise.all([
        this.getRanking('points'),
        this.getRanking('level'),
        this.getRanking('pet')
      ])

      this.setData({
        pointsRanking: pointsRes.ranking,
        levelRanking: levelRes.ranking,
        petRanking: petRes.ranking,
        myRanking: pointsRes.myRanking
      })
    } catch (error) {
      console.error('Load ranking data failed:', error)
      wx.showToast({
        title: '加载排行榜失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  async getRanking(type) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = this.generateMockRanking(type)
        resolve(mockData)
      }, 500)
    })
  },

  generateMockRanking(type) {
    const users = [
      { id: 1, nickname: '萌宠达人', avatar: '/assets/avatars/user1.png', points: 2580, level: 8, petName: '小可爱', petLevel: 15 },
      { id: 2, nickname: '宠物专家', avatar: '/assets/avatars/user2.png', points: 2340, level: 7, petName: '毛球球', petLevel: 12 },
      { id: 3, nickname: '爱心主人', avatar: '/assets/avatars/user3.png', points: 2100, level: 6, petName: '糖果', petLevel: 10 },
      { id: 4, nickname: '快乐养宠', avatar: '/assets/avatars/user4.png', points: 1890, level: 6, petName: '布丁', petLevel: 9 },
      { id: 5, nickname: '宠物之友', avatar: '/assets/avatars/user5.png', points: 1650, level: 5, petName: '奶茶', petLevel: 8 }
    ]

    let ranking = []
    let sortKey = ''

    switch (type) {
      case 'points':
        sortKey = 'points'
        break
      case 'level':
        sortKey = 'level'
        break
      case 'pet':
        sortKey = 'petLevel'
        break
    }

    ranking = users.sort((a, b) => b[sortKey] - a[sortKey]).map((user, index) => ({
      ...user,
      rank: index + 1
    }))

    return {
      ranking,
      myRanking: {
        rank: 15,
        points: 680,
        level: 3,
        petLevel: 5
      }
    }
  },

  onTabChange(e) {
    const { tab } = e.currentTarget.dataset
    this.setData({ currentTab: tab })
  },

  onUserTap(e) {
    const { user } = e.currentTarget.dataset
    wx.showToast({
      title: `查看${user.nickname}的详情`,
      icon: 'none'
    })
  },

  onRefresh() {
    this.loadRankingData()
  },

  getCurrentRanking() {
    const { currentTab } = this.data
    switch (currentTab) {
      case 'points':
        return this.data.pointsRanking
      case 'level':
        return this.data.levelRanking
      case 'pet':
        return this.data.petRanking
      default:
        return []
    }
  },

  getRankIcon(rank) {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return rank.toString()
    }
  }
})
