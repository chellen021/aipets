export const validateRequired = (value, message = '此字段为必填项') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return message
  }
  return null
}

export const validateMinLength = (value, minLength, message) => {
  if (!value || value.length < minLength) {
    return message || `最少需要${minLength}个字符`
  }
  return null
}

export const validateMaxLength = (value, maxLength, message) => {
  if (value && value.length > maxLength) {
    return message || `最多允许${maxLength}个字符`
  }
  return null
}

export const validateEmail = (email, message = '请输入有效的邮箱地址') => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (email && !emailRegex.test(email)) {
    return message
  }
  return null
}

export const validatePhone = (phone, message = '请输入有效的手机号码') => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (phone && !phoneRegex.test(phone)) {
    return message
  }
  return null
}

export const validatePetName = (name) => {
  const errors = []
  
  const requiredError = validateRequired(name, '宠物名称不能为空')
  if (requiredError) errors.push(requiredError)
  
  const minLengthError = validateMinLength(name, 2, '宠物名称至少需要2个字符')
  if (minLengthError) errors.push(minLengthError)
  
  const maxLengthError = validateMaxLength(name, 10, '宠物名称最多10个字符')
  if (maxLengthError) errors.push(maxLengthError)
  
  if (name && /[^\u4e00-\u9fa5a-zA-Z0-9]/.test(name)) {
    errors.push('宠物名称只能包含中文、英文和数字')
  }
  
  return errors.length > 0 ? errors[0] : null
}

export const validateImageFile = (file) => {
  if (!file) {
    return '请选择图片文件'
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return '只支持 JPG、PNG、GIF 格式的图片'
  }
  
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return '图片大小不能超过5MB'
  }
  
  return null
}

export const validatePoints = (points, availablePoints) => {
  if (!points || points <= 0) {
    return '积分数量必须大于0'
  }
  
  if (points > availablePoints) {
    return '积分不足'
  }
  
  return null
}

export const validateForm = (data, rules) => {
  const errors = {}
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field]
    const value = data[field]
    
    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) {
        errors[field] = error
        break
      }
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
