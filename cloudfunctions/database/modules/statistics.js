// 统计相关功能模块
const cloud = require('wx-server-sdk')
const { success, fail, handleError } = require('../utils/index')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 获取用户或医生的数据统计
 * @param {string} openid 用户openid
 */
async function getStatistics(openid) {
  try {
    // 检查用户是否存在
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      return fail('用户不存在')
    }
    
    const user = userResult.data[0]
    
    // 检查是否是医生
    const doctorResult = await db.collection('doctors').where({
      user_id: user._id
    }).get()
    
    if (doctorResult.data.length > 0) {
      // 医生统计
      const doctor = doctorResult.data[0]
      
      // 待确认预约数
      const pendingAppointmentResult = await db.collection('appointments').where({
        doctor_id: doctor._id,
        status: 0
      }).count()
      const pendingAppointmentCount = pendingAppointmentResult.total
      
      // 已确认预约数
      const confirmedAppointmentResult = await db.collection('appointments').where({
        doctor_id: doctor._id,
        status: 1
      }).count()
      const confirmedAppointmentCount = confirmedAppointmentResult.total
      
      // 已完成预约数
      const completedAppointmentResult = await db.collection('appointments').where({
        doctor_id: doctor._id,
        status: 2
      }).count()
      const completedAppointmentCount = completedAppointmentResult.total
      
      return success({
        pendingAppointmentCount,
        confirmedAppointmentCount,
        completedAppointmentCount,
        rating: doctor.rating,
        ratingCount: doctor.rating_count
      }, '获取成功')
    } else {
      // 普通用户统计
      // 预约总数
      const appointmentCountResult = await db.collection('appointments').where({
        user_id: user._id
      }).count()
      const appointmentCount = appointmentCountResult.total
      
      // 收藏医生数
      const favoriteCountResult = await db.collection('user_favorites').where({
        user_id: user._id
      }).count()
      const favoriteCount = favoriteCountResult.total
      
      return success({
        appointmentCount,
        favoriteCount
      }, '获取成功')
    }
  } catch (error) {
    return handleError(error)
  }
}

module.exports = {
  getStatistics
}