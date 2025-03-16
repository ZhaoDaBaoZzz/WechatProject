// 用户相关功能模块
const cloud = require('wx-server-sdk')
const { success, fail, handleError } = require('../utils/index')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 获取用户信息
 * @param {string} openid 用户openid
 */
async function getUserInfo(openid) {
  try {
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      return success(null, '用户不存在')
    }
    
    const user = userResult.data[0]
    
    // 获取用户角色信息
    const roleResult = await db.collection('roles').doc(user.role_id).get()
    
    return success({
      ...user,
      role: roleResult.data
    }, '获取成功')
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 更新用户信息
 * @param {string} openid 用户openid
 * @param {object} data 用户信息
 */
async function updateUserInfo(openid, data) {
  try {
    // 检查用户是否存在
    const userCheck = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userCheck.data.length === 0) {
      // 用户不存在，创建新用户
      // 默认为普通用户角色
      const defaultRoleResult = await db.collection('roles').where({
        code: 'user'
      }).get()
      
      if (defaultRoleResult.data.length === 0) {
        return fail('默认角色不存在')
      }
      
      const defaultRoleId = defaultRoleResult.data[0]._id
      
      const now = new Date()
      await db.collection('users').add({
        data: {
          _openid: openid,
          role_id: defaultRoleId,
          name: data.name || '',
          avatar: data.avatar || '',
          mobile: data.mobile || '',
          gender: data.gender || 0,
          create_time: now,
          update_time: now,
          last_login_time: now,
          status: 1
        }
      })
      
      return success(null, '用户创建成功')
    } else {
      // 用户存在，更新信息
      const updateData = {
        update_time: new Date(),
        last_login_time: new Date()
      }
      
      // 只更新提供的字段
      if (data.name) updateData.name = data.name
      if (data.avatar) updateData.avatar = data.avatar
      if (data.mobile) updateData.mobile = data.mobile
      if (data.gender !== undefined) updateData.gender = data.gender
      
      await db.collection('users').where({
        _openid: openid
      }).update({
        data: updateData
      })
      
      return success(null, '用户信息更新成功')
    }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * 申请成为医生
 * @param {string} openid 用户openid
 * @param {object} data 医生信息
 */
async function applyDoctor(openid, data) {
  try {
    // 检查用户是否存在
    const userResult = await db.collection('users').where({
      _openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      return fail('用户不存在')
    }
    
    const user = userResult.data[0]
    
    // 检查是否已经是医生
    const doctorResult = await db.collection('doctors').where({
      user_id: user._id
    }).get()
    
    if (doctorResult.data.length > 0) {
      return fail('您已经是医生或已提交申请')
    }
    
    // 创建医生记录
    const now = new Date()
    const doctorId = await db.collection('doctors').add({
      data: {
        user_id: user._id,
        title: data.title || '',
        field: data.field || '',
        skills: data.skills || [],
        experience: data.experience || 0,
        description: data.description || '',
        avatar: user.avatar,
        rating: 5.0,  // 初始评分
        rating_count: 0,
        case_count: 0,
        appointment_count: 0,
        response_rate: 100,
        price: data.price || 0,
        status: 0,  // 默认离线
        create_time: now,
        update_time: now
      }
    })
    
    // 上传认证信息
    if (data.certifications && data.certifications.length > 0) {
      for (const cert of data.certifications) {
        await db.collection('doctor_certifications').add({
          data: {
            doctor_id: doctorId._id,
            name: cert.name,
            image: cert.image,
            issue_date: cert.issue_date ? new Date(cert.issue_date) : null,
            expiry_date: cert.expiry_date ? new Date(cert.expiry_date) : null,
            status: 0,  // 待审核
            create_time: now,
            update_time: now,
            remark: ''
          }
        })
      }
    }
    
    return success(null, '医生申请提交成功，等待审核')
  } catch (error) {
    return handleError(error)
  }
}

module.exports = {
  getUserInfo,
  updateUserInfo,
  applyDoctor
}