// 云函数入口文件
const cloud = require('wx-server-sdk')

// 导入各个功能模块
const userModule = require('./modules/user')
const doctorModule = require('./modules/doctor')
const appointmentModule = require('./modules/appointment')
const favoriteModule = require('./modules/favorite')
const reviewModule = require('./modules/review')
const statisticsModule = require('./modules/statistics')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  // 根据action参数执行不同的数据库操作
  switch (action) {
    // 用户相关操作
    case 'getUserInfo':
      return await userModule.getUserInfo(openid)
    case 'updateUserInfo':
      return await userModule.updateUserInfo(openid, data)
    case 'applyDoctor':
      return await userModule.applyDoctor(openid, data)
    
    // 医生相关操作
    case 'getDoctorList':
      return await doctorModule.getDoctorList(data)
    case 'getDoctorDetail':
      return await doctorModule.getDoctorDetail(data.doctorId)
    case 'updateDoctorInfo':
      return await doctorModule.updateDoctorInfo(openid, data)
    
    // 预约相关操作
    case 'createAppointment':
      return await appointmentModule.createAppointment(openid, data)
    case 'getUserAppointments':
      return await appointmentModule.getUserAppointments(openid, data)
    case 'getDoctorAppointments':
      return await appointmentModule.getDoctorAppointments(openid, data)
    case 'updateAppointmentStatus':
      return await appointmentModule.updateAppointmentStatus(openid, data)
    
    // 收藏相关操作
    case 'favoriteDoctor':
      return await favoriteModule.favoriteDoctor(openid, data)
    case 'getUserFavorites':
      return await favoriteModule.getUserFavorites(openid, data)
    case 'checkUserFavorite':
      return await favoriteModule.checkUserFavorite(openid, data)
    
    // 评价相关操作
    case 'createReview':
      return await reviewModule.createReview(openid, data)
    case 'getDoctorReviews':
      return await reviewModule.getDoctorReviews(data)
    
    // 统计相关操作
    case 'getStatistics':
      return await statisticsModule.getStatistics(openid)
    
    default:
      return {
        code: -1,
        message: '未知的操作类型'
      }
  }
}