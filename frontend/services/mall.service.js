import request from './request'

class MallService {
  async getProducts(category = '', page = 1, limit = 20) {
    return request.get('/mall/products', { category, page, limit })
  }

  async getProductDetail(productId) {
    return request.get(`/mall/products/${productId}`)
  }

  async purchaseProduct(productId, quantity = 1) {
    return request.post('/mall/purchase', { productId, quantity })
  }

  async getOrderHistory(page = 1, limit = 20) {
    return request.get('/mall/orders', { page, limit })
  }

  async getCategories() {
    return request.get('/mall/categories')
  }
}

export default new MallService()
