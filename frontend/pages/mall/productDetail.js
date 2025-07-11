import { createStoreBindings } from 'mobx-miniprogram-bindings'
import store from '../../store/index'
import MallService from '../../services/mall.service'

Page({
  data: {
    product: null,
    quantity: 1,
    isLoading: false,
    isPurchasing: false
  },

  onLoad(options) {
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

    if (options.id) {
      this.loadProductDetail(options.id)
    }
  },

  onUnload() {
    this.storeBindings.destroyStoreBindings()
  },

  async loadProductDetail(productId) {
    try {
      this.setData({ isLoading: true })
      
      const product = await MallService.getProductDetail(productId)
      this.setData({ product })
    } catch (error) {
      console.error('Load product detail failed:', error)
      this.loadMockProduct(productId)
    } finally {
      this.setData({ isLoading: false })
    }
  },

  loadMockProduct(productId) {
    const mockProduct = {
      id: productId,
      name: '高级宠物食物',
      price: 50,
      image: '/assets/products/food1.png',
      category: 'food',
      description: '营养丰富的高级宠物食物，能够显著提升宠物的心情和健康状态。',
      details: '这款高级宠物食物采用优质原料制作，富含蛋白质、维生素和矿物质，能够满足宠物的营养需求。使用后可以提升宠物心情+20，饥饿度+30。',
      effects: [
        { name: '心情', value: '+20' },
        { name: '饥饿度', value: '+30' },
        { name: '健康度', value: '+10' }
      ],
      stock: 99,
      sales: 1234
    }
    
    this.setData({ product: mockProduct })
  },

  onQuantityChange(e) {
    const { type } = e.currentTarget.dataset
    let { quantity } = this.data
    
    if (type === 'minus' && quantity > 1) {
      quantity--
    } else if (type === 'plus' && quantity < 99) {
      quantity++
    }
    
    this.setData({ quantity })
  },

  onQuantityInput(e) {
    let quantity = parseInt(e.detail.value) || 1
    quantity = Math.max(1, Math.min(99, quantity))
    this.setData({ quantity })
  },

  async onPurchase() {
    const { product, quantity } = this.data
    const totalPrice = product.price * quantity
    
    if (this.data.points < totalPrice) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ isPurchasing: true })
      
      await MallService.purchaseProduct(product.id, quantity)
      
      this.updatePoints(this.data.points - totalPrice)
      
      wx.showToast({
        title: '购买成功！',
        icon: 'success'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('Purchase failed:', error)
      wx.showToast({
        title: error.message || '购买失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isPurchasing: false })
    }
  },

  onPreviewImage() {
    if (this.data.product && this.data.product.image) {
      wx.previewImage({
        urls: [this.data.product.image],
        current: this.data.product.image
      })
    }
  }
})
