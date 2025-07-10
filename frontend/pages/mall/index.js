import { createStoreBindings } from 'mobx-miniprogram-bindings'
import store from '../../store/index'
import MallService from '../../services/mall.service'

Page({
  data: {
    categories: [],
    products: [],
    currentCategory: '',
    isLoading: false,
    hasMore: true,
    page: 1
  },

  onLoad() {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: {
        userInfo: () => store.userStore.userInfo,
        points: () => store.userStore.points
      },
      actions: {
        updatePoints: store.userStore.updatePoints
      }
    })

    this.loadInitialData()
  },

  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },

  async loadInitialData() {
    try {
      this.setData({ isLoading: true })
      
      const [categoriesRes, productsRes] = await Promise.all([
        MallService.getCategories(),
        MallService.getProducts('', 1, 20)
      ])

      this.setData({
        categories: [{ id: '', name: '全部', icon: '🛍️' }, ...categoriesRes.categories],
        products: productsRes.products,
        hasMore: productsRes.hasMore
      })
    } catch (error) {
      console.error('Load mall data failed:', error)
      this.loadMockData()
    } finally {
      this.setData({ isLoading: false })
    }
  },

  loadMockData() {
    const mockCategories = [
      { id: '', name: '全部', icon: '🛍️' },
      { id: 'food', name: '食物', icon: '🍎' },
      { id: 'toys', name: '玩具', icon: '🎾' },
      { id: 'accessories', name: '装饰', icon: '👑' },
      { id: 'special', name: '特殊', icon: '✨' }
    ]

    const mockProducts = [
      { id: 1, name: '高级宠物食物', price: 50, image: '/assets/products/food1.png', category: 'food', description: '营养丰富，提升宠物心情' },
      { id: 2, name: '互动玩具球', price: 30, image: '/assets/products/toy1.png', category: 'toys', description: '增加宠物活力和快乐' },
      { id: 3, name: '可爱蝴蝶结', price: 20, image: '/assets/products/acc1.png', category: 'accessories', description: '让宠物更加可爱' },
      { id: 4, name: '经验加速器', price: 100, image: '/assets/products/special1.png', category: 'special', description: '快速提升宠物等级' },
      { id: 5, name: '清洁套装', price: 40, image: '/assets/products/clean1.png', category: 'accessories', description: '保持宠物清洁' },
      { id: 6, name: '训练道具', price: 60, image: '/assets/products/train1.png', category: 'toys', description: '提升宠物技能' }
    ]

    this.setData({
      categories: mockCategories,
      products: mockProducts,
      hasMore: false
    })
  },

  onCategoryChange(e) {
    const { category } = e.currentTarget.dataset
    this.setData({
      currentCategory: category,
      products: [],
      page: 1,
      hasMore: true
    })
    this.loadProducts()
  },

  async loadProducts() {
    if (this.data.isLoading || !this.data.hasMore) return

    try {
      this.setData({ isLoading: true })
      
      const response = await MallService.getProducts(
        this.data.currentCategory,
        this.data.page,
        20
      )

      const newProducts = this.data.page === 1 ? response.products : [...this.data.products, ...response.products]
      
      this.setData({
        products: newProducts,
        hasMore: response.hasMore,
        page: this.data.page + 1
      })
    } catch (error) {
      console.error('Load products failed:', error)
      wx.showToast({
        title: '加载商品失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  onProductTap(e) {
    const { product } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/mall/productDetail?id=${product.id}`
    })
  },

  async onQuickPurchase(e) {
    e.stopPropagation()
    const { product } = e.currentTarget.dataset
    
    if (this.data.points < product.price) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      })
      return
    }

    try {
      await MallService.purchaseProduct(product.id, 1)
      
      this.updatePoints(this.data.points - product.price)
      
      wx.showToast({
        title: '购买成功！',
        icon: 'success'
      })
    } catch (error) {
      console.error('Purchase failed:', error)
      wx.showToast({
        title: error.message || '购买失败',
        icon: 'none'
      })
    }
  },

  onReachBottom() {
    this.loadProducts()
  },

  onPullDownRefresh() {
    this.setData({
      products: [],
      page: 1,
      hasMore: true
    })
    this.loadProducts().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
