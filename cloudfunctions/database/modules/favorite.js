// 收藏相关功能模块
const cloud = require('wx-server-sdk')
const { success, fail, handleError } = require('../utils/index')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 收藏/取消收藏医生
 * @param {string} openid 用户openid
 * @param {object} data 收藏数据
 */
async function favoriteDoctor(openid, data) {
  try {
    // 检查用户是否存在
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      return fail('用户不存在')
    }
    
    const user = userResult.data[0]
    
    // 检查医生是否存在
    const doctorResult = await db.collection('doctors').doc(data.doctorId).get()
    if (!doctorResult.data) {
      return fail('医生不存在')
    }
    
    // 检查是否已收藏
    const favoriteCheck = await db.collection('user_favorites').where({
      user_id: user._id,
      doctor_id: data.doctorId
    }).get()
    
    if (favoriteCheck.data.length > 0) {
      // 已收藏，取消收藏
      await db.collection('user_favorites').doc(favoriteCheck.data[0]._id).remove()
      
      return success({
        isFavorite: false
      }, '取消收藏成功')
    } else {
      // 未收藏，添加收藏
      const now = new Date()
      await db.collection('user_favorites').add({
        data: {
          user_id: user._id,
          doctor_id: data.doctorId,
          create_time: now
        }
      })
      
      return success({
        isFavorite: true
      }, '收藏成功')
    }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 获取用户收藏的医生列表
 * @param {string} openid 用户openid
 * @param {object} data 查询参数
 */
async function getUserFavorites(openid, data) {
  try {
    // 检查用户是否存在
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      return fail('用户不存在')
    }
    
    const user = userResult.data[0]
    
    // 分页
    const pageSize = data.pageSize || 10
    const page = data.page || 1
    const skip = (page - 1) * pageSize
    
    // 获取收藏记录
    const favoriteQuery = db.collection('user_favorites').where({
      user_id: user._id
    })
    
    // 获取总数
    const countResult = await favoriteQuery.count()
    const total = countResult.total
    
    // 排序
    const favoriteResult = await favoriteQuery.orderBy('create_time', 'desc').skip(skip).limit(pageSize).get()
    
    // 获取医生信息
    const favorites = []
    for (const favorite of favoriteResult.data) {
      const doctorResult = await db.collection('doctors').doc(favorite.doctor_id).get()
      const doctor = doctorResult.data
      
      // 获取医生用户信息
      const doctorUserResult = await db.collection('users').doc(doctor.user_id).get()
      
      favorites.push({
        ...favorite,
        doctor: {
          ...doctor,
          user: doctorUserResult.data
        }
      })
    }
    
    return success({
      favorites,
      total,
      page,
      pageSize,
      hasMore: skip + favorites.length < total
    }, '获取成功')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 检查用户是否收藏了医生
 * @param {string} openid 用户openid
 * @param {object} data 查询参数
 */
async function checkUserFavorite(openid, data) {
  try {
    // 检查用户是否存在
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      return fail('用户不存在')
    }
    
    const user = userResult.data[0]
    
    // 检查医生是否存在
    const doctorResult = await db.collection('doctors').doc(data.doctorId).get()
    if (!doctorResult.data) {
      return fail('医生不存在')
    }
    
    // 检查是否已收藏
    const favoriteCheck = await db.collection('user_favorites').where({
      user_id: user._id,
      doctor_id: data.doctorId
    }).get()
    
    return success({
      isFavorite: favoriteCheck.data.length > 0
    }, '获取成功')
  } catch (error) {
    return handleError(error)
  }
}

module.exports = {
  favoriteDoctor,
  getUserFavorites,
  checkUserFavorite
}