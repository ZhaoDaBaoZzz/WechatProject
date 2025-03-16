// pages/appointment/create.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    doctor: {}, // 医生信息
    date: '', // 选择的日期
    startDate: '', // 可选择的开始日期（今天）
    endDate: '', // 可选择的结束日期（30天后）
    timeSlots: [], // 时间段列表
    selectedTimeSlot: -1, // 选中的时间段索引
    consultTypes: [
      { name: '线上咨询', value: 'online', checked: true },
      { name: '线下面诊', value: 'offline', checked: false }
    ],
    consultType: 'online', // 咨询类型
    problem: '', // 咨询问题
    problemLength: 0, // 问题字数
    phone: '', // 联系电话
    formValid: false // 表单是否有效
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取医生ID
    const doctorId = options.id;
    
    // 初始化日期范围
    this.initDateRange();
    
    // 初始化时间段
    this.initTimeSlots();
    
    // 获取医生信息
    this.getDoctorInfo(doctorId);
    
    // 检查用户是否已登录
    this.checkLoginStatus();
  },

  /**
   * 初始化日期范围
   */
  initDateRange() {
    const today = new Date();
    const startDate = this.formatDate(today);
    
    // 设置结束日期为30天后
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 30);
    
    this.setData({
      startDate,
      endDate: this.formatDate(endDate)
    });
  },

  /**
   * 格式化日期为YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 初始化时间段
   */
  initTimeSlots() {
    // 模拟时间段数据，实际应从医生排班中获取
    const slots = [
      { time: '09:00-10:00', available: true },
      { time: '10:00-11:00', available: true },
      { time: '11:00-12:00', available: false },
      { time: '14:00-15:00', available: true },
      { time: '15:00-16:00', available: true },
      { time: '16:00-17:00', available: false },
      { time: '17:00-18:00', available: true }
    ];
    
    this.setData({ timeSlots: slots });
  },

  /**
   * 获取医生信息
   */
  getDoctorInfo(doctorId) {
    // 模拟医生数据，实际应从云数据库获取
    const doctor = {
      id: doctorId || '1',
      name: '张医生',
      avatar: 'https://placekitten.com/200/200', // 使用占位图
      title: '心理咨询师 | 国家二级心理咨询师',
      rating: 4.9
    };
    
    this.setData({ doctor });
  },

  /**
   * 检查用户是否已登录
   */
  checkLoginStatus() {
    // 实际应检查用户是否已登录，未登录则跳转到登录页
    // 这里简化处理
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      // 未登录状态下可以先浏览，但提交时需要登录
      console.log('用户未登录');
    }
  },

  /**
   * 日期选择器变化事件
   */
  bindDateChange(e) {
    const date = e.detail.value;
    this.setData({ date });
    
    // 根据选择的日期更新可用时间段
    this.updateTimeSlots(date);
    
    // 验证表单
    this.validateForm();
  },

  /**
   * 更新时间段
   */
  updateTimeSlots(date) {
    // 实际应根据医生排班和已有预约查询可用时间段
    // 这里简化处理，随机设置可用状态
    const slots = this.data.timeSlots.map(slot => {
      return {
        ...slot,
        available: Math.random() > 0.3 // 70%概率可用
      };
    });
    
    this.setData({ 
      timeSlots: slots,
      selectedTimeSlot: -1 // 重置选中状态
    });
  },

  /**
   * 选择时间段
   */
  selectTimeSlot(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ selectedTimeSlot: index });
    
    // 验证表单
    this.validateForm();
  },

  /**
   * 咨询类型变更
   */
  bindConsultTypeChange(e) {
    const consultType = e.detail.value;
    this.setData({ consultType });
  },

  /**
   * 咨询问题输入
   */
  bindProblemInput(e) {
    const problem = e.detail.value;
    const problemLength = problem.length;
    
    this.setData({ 
      problem,
      problemLength
    });
    
    // 验证表单
    this.validateForm();
  },

  /**
   * 手机号输入
   */
  bindPhoneInput(e) {
    const phone = e.detail.value;
    this.setData({ phone });
    
    // 验证表单
    this.validateForm();
  },

  /**
   * 验证表单
   */
  validateForm() {
    const { date, selectedTimeSlot, problem, phone } = this.data;
    
    // 验证所有必填项
    const isValid = (
      date && 
      selectedTimeSlot !== -1 && 
      problem.trim().length > 0 && 
      this.validatePhone(phone)
    );
    
    this.setData({ formValid: isValid });
  },

  /**
   * 验证手机号
   */
  validatePhone(phone) {
    // 简单的手机号验证
    const phoneReg = /^1[3-9]\d{9}$/;
    return phoneReg.test(phone);
  },

  /**
   * 提交预约
   */
  submitAppointment() {
    // 再次验证表单
    if (!this.data.formValid) {
      wx.showToast({
        title: '请完成所有必填项',
        icon: 'none'
      });
      return;
    }
    
    // 检查用户是否已登录
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      // 未登录，跳转到登录页或弹出登录框
      wx.showModal({
        title: '提示',
        content: '请先登录后再提交预约',
        success: (res) => {
          if (res.confirm) {
            // 跳转到登录页
            wx.navigateTo({
              url: '/pages/profile/index'
            });
          }
        }
      });
      return;
    }
    
    // 构建预约数据
    const { doctor, date, selectedTimeSlot, timeSlots, consultType, problem, phone } = this.data;
    const appointmentData = {
      doctorId: doctor.id,
      userId: userInfo.openid, // 用户ID
      date,
      timeSlot: timeSlots[selectedTimeSlot].time,
      consultType,
      problem,
      phone,
      status: 0, // 0-待确认
      createTime: new Date().getTime()
    };
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...'
    });
    
    // 模拟提交到云数据库
    setTimeout(() => {
      wx.hideLoading();
      
      // 提交成功
      wx.showModal({
        title: '预约成功',
        content: '您的预约申请已提交，医生将在24小时内确认',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            // 跳转到预约列表页
            wx.navigateTo({
              url: '/pages/appointment/list'
            });
          }
        }
      });
    }, 1500);
  }
});