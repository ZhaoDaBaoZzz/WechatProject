// 工具函数

/**
 * 成功响应
 * @param {any} data 响应数据
 * @param {string} message 响应消息
 * @returns {object} 响应对象
 */
function success(data, message = '操作成功') {
  return {
    code: 0,
    data,
    message
  }
}

/**
 * 失败响应
 * @param {string} message 错误消息
 * @param {number} code 错误码，默认-1
 * @returns {object} 响应对象
 */
function fail(message = '操作失败', code = -1) {
  return {
    code,
    message
  }
}

/**
 * 统一错误处理
 * @param {Error} error 错误对象
 * @returns {object} 错误响应
 */
function handleError(error) {
  console.error('操作失败', error)
  return fail(error.message || '服务器内部错误')
}

module.exports = {
  success,
  fail,
  handleError
}