// 医生相关功能模块
const cloud = require('wx-server-sdk')
const { success, fail, handleError } = require('../utils/index')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 获取医生列表
 * @param {object} data 查询参数
 */
async function getDoctorList(data) {
  try {
    // 构建查询条件
    let query = db.collection('doctors').where({
      status: 1 // 只查询状态正常的医生
    })
    
    // 按领域筛选
    if (data.field) {
      query = query.where({
        field: data.field
      })
    }
    
    // 按技能筛选
    if (data.skill) {
      query = query.where({
        skills: db.command.all([data.skill])
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
    if (data.sortField && data.sortOrder) {
      query = query.orderBy(data.sortField, data.sortOrder === 'asc' ? 'asc' : 'desc')
    } else {
      // 默认按评分降序
      query = query.orderBy('rating', 'desc')
    }
    
    // 执行查询
    const result = await query.skip(skip).limit(pageSize).get()
    
    // 获取用户信息
    const doctors = []
    for (const doctor of result.data) {
      const userResult = await db.collection('users').doc(doctor.user_id).get()
      
      doctors.push({
        ...doctor,
        user: userResult.data
      })
    }
    
    return success({
      doctors,
      total,
      page,
      pageSize,
      hasMore: skip + doctors.length < total
    }, '获取成功')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 获取医生详情
 * @param {string} doctorId 医生ID
 */
async function getDoctorDetail(doctorId) {
  try {
    // 获取医生信息
    const doctorResult = await db.collection('doctors').doc(doctorId).get()
    const doctor = doctorResult.data
    
    if (!doctor) {
      return fail('医生不存在')
    }
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(doctor.user_id).get()
    
    // 获取认证信息
    const certificationResult = await db.collection('doctor_certifications').where({
      doctor_id: doctorId,
      status: 1 // 只查询已通过的认证
    }).get()
    
    // 获取排班信息
    const scheduleResult = await db.collection('doctor_schedules').where({
      doctor_id: doctorId,
      date: db.command.gte(new Date()) // 只查询当前日期之后的排班
    }).orderBy('date', 'asc').get()
    
    return success({
      ...doctor,
      user: userResult.data,
      certifications: certificationResult.data,
      schedules: scheduleResult.data
    }, '获取成功')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 更新医生信息
 * @param {string} openid 用户openid
 * @param {object} data 医生信息
 */
async function updateDoctorInfo(openid, data) {
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
      return fail('该用户不是医生')
    }
    
    const doctor = doctorResult.data[0]
    
    // 更新医生信息
    await db.collection('doctors').doc(doctor._id).update({
      data: {
        ...data,
        update_time: db.serverDate()
      }
    })
    
    return success({}, '更新成功')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 添加医生排班
 * @param {string} doctorId 医生ID
 * @param {object} scheduleData 排班信息
 */
async function addDoctorSchedule(doctorId, scheduleData) {
  try {
    // 检查医生是否存在
    const doctorResult = await db.collection('doctors').doc(doctorId).get()
    
    if (!doctorResult.data) {
      return fail('医生不存在')
    }
    
    // 检查是否已有相同时间段的排班
    const existingSchedule = await db.collection('doctor_schedules').where({
      doctor_id: doctorId,
      date: new Date(scheduleData.date),
      start_time: scheduleData.start_time,
      end_time: scheduleData.end_time
    }).get()
    
    if (existingSchedule.data.length > 0) {
      return fail('该时间段已有排班')
    }
    
    // 添加排班
    const result = await db.collection('doctor_schedules').add({
      data: {
        doctor_id: doctorId,
        date: new Date(scheduleData.date),
        start_time: scheduleData.start_time,
        end_time: scheduleData.end_time,
        max_patients: scheduleData.max_patients || 10,
        booked_count: 0,
        status: 1, // 1: 正常, 0: 已取消
        create_time: db.serverDate()
      }
    })
    
    return success({ schedule_id: result._id }, '添加排班成功')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 取消医生排班
 * @param {string} scheduleId 排班ID
 */
async function cancelDoctorSchedule(scheduleId) {
  try {
    // 检查排班是否存在
    const scheduleResult = await db.collection('doctor_schedules').doc(scheduleId).get()
    
    if (!scheduleResult.data) {
      return fail('排班不存在')
    }
    
    const schedule = scheduleResult.data
    
    // 检查是否已有预约
    if (schedule.booked_count > 0) {
      return fail('该排班已有患者预约，无法取消')
    }
    
    // 更新排班状态
    await db.collection('doctor_schedules').doc(scheduleId).update({
      data: {
        status: 0, // 设置为已取消
        update_time: db.serverDate()
      }
    })
    
    return success({}, '取消排班成功')
  } catch (error) {
    return handleError(error)
  }
}

module.exports = {
  getDoctorList,
  getDoctorDetail,
  updateDoctorInfo,
  addDoctorSchedule,
  cancelDoctorSchedule
}