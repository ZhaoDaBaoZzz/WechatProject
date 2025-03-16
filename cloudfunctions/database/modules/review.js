// 评价相关功能模块
const cloud = require('wx-server-sdk')
const { success, fail, handleError } = require('../utils/index')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 创建评价
 * @param {string} openid 用户openid
 * @param {object} data 评价数据
 */
async function createReview(openid, data) {
  try {
    // 检查用户是否存在
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      return fail('用户不存在')
    }
    
    const user = userResult.data[0]
    
    // 检查预约是否存在
    const appointmentResult = await db.collection('appointments').doc(data.appointmentId).get()
    if (!appointmentResult.data) {
      return fail('预约不存在')
    }
    
    const appointment = appointmentResult.data
    
    // 检查预约是否属于该用户
    if (appointment.user_id !== user._id) {
      return fail('无权评价此预约')
    }
    
    // 检查预约是否已完成
    if (appointment.status !== 2) {
      return fail('只能评价已完成的预约')
    }
    
    // 检查是否已评价
    const reviewCheck = await db.collection('reviews').where({
      appointment_id: data.appointmentId
    }).get()
    
    if (reviewCheck.data.length > 0) {
      return fail('该预约已评价')
    }
    
    // 创建评价
    const now = new Date()
    const reviewId = await db.collection('reviews').add({
      data: {
        user_id: user._id,
        doctor_id: appointment.doctor_id,
        appointment_id: data.appointmentId,
        rating: data.rating,
        content: data.content || '',
        is_anonymous: data.isAnonymous || false,
        status: 1, // 正常
        create_time: now,
        update_time: now
      }
    })
    
    // 更新医生评分
    const doctorResult = await db.collection('doctors').doc(appointment.doctor_id).get()
    const doctor = doctorResult.data
    
    // 计算新评分
    const newRatingCount = doctor.rating_count + 1
    const newRating = ((doctor.rating * doctor.rating_count) + data.rating) / newRatingCount
    
    // 更新医生评分
    await db.collection('doctors').doc(appointment.doctor_id).update({
      data: {
        rating: newRating,
        rating_count: newRatingCount
      }
    })
    
    return success({
      reviewId: reviewId._id
    }, '评价成功')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 获取医生评价列表
 * @param {object} data 查询参数
 */
async function getDoctorReviews(data) {
  try {
    // 检查医生是否存在
    const doctorResult = await db.collection('doctors').doc(data.doctorId).get()
    if (!doctorResult.data) {
      return fail('医生不存在')
    }
    
    // 构建查询条件
    let query = db.collection('reviews').where({
      doctor_id: data.doctorId,
      status: 1
    })
    
    // 分页
    const pageSize = data.pageSize || 10
    const page = data.page || 1
    const skip = (page - 1) * pageSize
    
    // 获取总数
    const countResult = await query.count()
    const total = countResult.total
    
    // 排序
    query = query.orderBy('create_time', 'desc')
    
    // 执行查询
    const result = await query.skip(skip).limit(pageSize).get()
    
    // 获取用户信息
    const reviews = []
    for (const review of result.data) {
      // 获取用户信息（如果不是匿名评价）
      let userInfo = null
      if (!review.is_anonymous) {
        const userResult = await db.collection('users').doc(review.user_id).get()
        userInfo = userResult.data
      }
      
      // 获取预约信息
      const appointmentResult = await db.collection('appointments').doc(review.appointment_id).get()
      
      reviews.push({
        ...review,
        user: userInfo,
        appointment: appointmentResult.data
      })
    }
    
    return success({
      reviews,
      total,
      page,
      pageSize,
      hasMore: skip + reviews.length < total
    }, '获取成功')
  } catch (error) {
    return handleError(error)
  }
}

module.exports = {
  createReview,
  getDoctorReviews
}