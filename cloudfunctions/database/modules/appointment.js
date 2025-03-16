// 预约相关功能模块
const cloud = require('wx-server-sdk')
const { success, fail, handleError } = require('../utils/index')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 创建预约
 * @param {string} openid 用户openid
 * @param {object} data 预约数据
 */
async function createAppointment(openid, data) {
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
    
    // 检查排班是否存在
    const scheduleResult = await db.collection('doctor_schedules').doc(data.scheduleId).get()
    if (!scheduleResult.data) {
      return fail('排班不存在')
    }
    
    const schedule = scheduleResult.data
    
    // 检查排班是否已被预约
    if (schedule.status !== 1) {
      return fail('该时段已被预约或不可用')
    }
    
    // 创建预约记录
    const now = new Date()
    const appointmentId = await db.collection('appointments').add({
      data: {
        user_id: user._id,
        doctor_id: data.doctorId,
        schedule_id: data.scheduleId,
        appointment_date: schedule.date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        status: 0, // 待确认
        remark: data.remark || '',
        create_time: now,
        update_time: now
      }
    })
    
    // 更新排班状态
    await db.collection('doctor_schedules').doc(data.scheduleId).update({
      data: {
        status: 2, // 已预约
        appointment_id: appointmentId._id
      }
    })
    
    return success({
      appointmentId: appointmentId._id
    }, '预约创建成功，等待医生确认')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 获取用户预约列表
 * @param {string} openid 用户openid
 * @param {object} data 查询参数
 */
async function getUserAppointments(openid, data) {
  try {
    // 检查用户是否存在
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      return fail('用户不存在')
    }
    
    const user = userResult.data[0]
    
    // 构建查询条件
    let query = db.collection('appointments').where({
      user_id: user._id
    })
    
    // 按状态筛选
    if (data.status !== undefined) {
      query = query.where({
        status: data.status
      })
    }
    
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
    
    // 获取医生信息
    const appointments = []
    for (const appointment of result.data) {
      const doctorResult = await db.collection('doctors').doc(appointment.doctor_id).get()
      const doctor = doctorResult.data
      
      // 获取医生用户信息
      const doctorUserResult = await db.collection('users').doc(doctor.user_id).get()
      
      appointments.push({
        ...appointment,
        doctor: {
          ...doctor,
          user: doctorUserResult.data
        }
      })
    }
    
    return success({
      appointments,
      total,
      page,
      pageSize,
      hasMore: skip + appointments.length < total
    }, '获取成功')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 获取医生预约列表
 * @param {string} openid 医生用户openid
 * @param {object} data 查询参数
 */
async function getDoctorAppointments(openid, data) {
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
    
    if (doctorResult.data.length === 0) {
      return fail('您不是医生')
    }
    
    const doctor = doctorResult.data[0]
    
    // 构建查询条件
    let query = db.collection('appointments').where({
      doctor_id: doctor._id
    })
    
    // 按状态筛选
    if (data.status !== undefined) {
      query = query.where({
        status: data.status
      })
    }
    
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
    const appointments = []
    for (const appointment of result.data) {
      const userResult = await db.collection('users').doc(appointment.user_id).get()
      
      appointments.push({
        ...appointment,
        user: userResult.data
      })
    }
    
    return success({
      appointments,
      total,
      page,
      pageSize,
      hasMore: skip + appointments.length < total
    }, '获取成功')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 更新预约状态
 * @param {string} openid 医生用户openid
 * @param {object} data 更新数据
 */
async function updateAppointmentStatus(openid, data) {
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
    
    if (doctorResult.data.length === 0) {
      return fail('您不是医生')
    }
    
    const doctor = doctorResult.data[0]
    
    // 检查预约是否存在
    const appointmentResult = await db.collection('appointments').doc(data.appointmentId).get()
    if (!appointmentResult.data) {
      return fail('预约不存在')
    }
    
    const appointment = appointmentResult.data
    
    // 检查是否是该医生的预约
    if (appointment.doctor_id !== doctor._id) {
      return fail('无权操作此预约')
    }
    
    // 更新预约状态
    await db.collection('appointments').doc(data.appointmentId).update({
      data: {
        status: data.status,
        update_time: new Date(),
        remark: data.remark || appointment.remark
      }
    })
    
    // 如果取消预约，恢复排班状态
    if (data.status === 3) {
      await db.collection('doctor_schedules').doc(appointment.schedule_id).update({
        data: {
          status: 1, // 可预约
          appointment_id: null
        }
      })
    }
    
    return success(null, '预约状态更新成功')
  } catch (error) {
    return handleError(error)
  }
}

module.exports = {
  createAppointment,
  getUserAppointments,
  getDoctorAppointments,
  updateAppointmentStatus
}