// pages/doctors/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    doctor: null, // 医生信息
    isLoading: true, // 是否正在加载
    isFavorite: false, // 是否已收藏
    isLoggedIn: false, // 是否已登录
    // 模拟数据
    mockDoctors: [
      {
        id: 1,
        name: '张医生',
        title: '国家二级心理咨询师',
        field: '心理咨询',
        rating: 4.9,
        ratingCount: 128,
        experience: 5,
        description: '擅长各类心理问题咨询，包括情绪管理、人际关系、自我成长等方面。',
        avatar: '/images/doctors/doctor1.png',
        skills: ['情绪管理', '人际关系', '自我成长', '职场压力'],
        certificates: [
          { id: 1, name: '心理咨询师证书', image: '/images/certificates/cert1.png' },
          { id: 2, name: '执业资格证', image: '/images/certificates/cert2.png' }
        ],
        reviews: [
          { id: 1, name: '匿名用户', avatar: '/images/default_avatar.png', date: '2023-05-10', rating: 5, content: '医生很专业，帮我解决了长期困扰的问题，非常感谢！' },
          { id: 2, name: '匿名用户', avatar: '/images/default_avatar.png', date: '2023-05-05', rating: 4.5, content: '咨询过程很舒适，医生很有耐心，给出的建议很实用。' }
        ],
        caseCount: 156,
        appointmentCount: 328,
        responseRate: 98
      },
      {
        id: 2,
        name: '李医生',
        title: '临床心理医师',
        field: '婚姻家庭',
        rating: 4.8,
        ratingCount: 96,
        experience: 8,
        description: '专注于婚姻家庭咨询，擅长处理夫妻关系、亲子关系等家庭问题。',
        avatar: '/images/doctors/doctor2.png',
        skills: ['婚姻关系', '亲子沟通', '家庭矛盾调解', '情感挽回'],
        certificates: [
          { id: 1, name: '临床心理医师证书', image: '/images/certificates/cert3.png' },
          { id: 2, name: '婚姻家庭咨询师证书', image: '/images/certificates/cert4.png' }
        ],
        reviews: [
          { id: 1, name: '匿名用户', avatar: '/images/default_avatar.png', date: '2023-05-12', rating: 5, content: '李医生帮我和丈夫解决了长期的沟通问题，现在家庭关系和谐多了。' },
          { id: 2, name: '匿名用户', avatar: '/images/default_avatar.png', date: '2023-05-08', rating: 4.5, content: '医生很有耐心，给出的建议很实用，帮助我们家庭重新找回了幸福。' }
        ],
        caseCount: 128,
        appointmentCount: 256,
        responseRate: 95
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取医生ID
    const { id } = options;
    if (!id) {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 检查收藏状态
    this.checkFavoriteStatus(parseInt(id));
    
    // 加载医生详情
    this.loadDoctorDetail(parseInt(id));
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 检查登录状态和收藏状态，以便在返回页面时更新
    const { doctor } = this.data;
    if (doctor) {
      this.checkLoginStatus();
      this.checkFavoriteStatus(doctor.id);
    }
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      isLoggedIn: !!userInfo
    });
  },
  
  // 检查收藏状态
  checkFavoriteStatus(doctorId) {
    const favorites = wx.getStorageSync('doctor_favorites') || [];
    this.setData({
      isFavorite: favorites.includes(doctorId)
    });
  },
  
  // 加载医生详情
  loadDoctorDetail(doctorId) {
    this.setData({
      isLoading: true
    });
    
    // 实际项目中，这里应该调用云函数获取数据
    // 示例代码使用模拟数据
    wx.showLoading({
      title: '加载中'
    });
    
    // 模拟云函数调用
    setTimeout(() => {
      // 查找对应ID的医生
      const doctor = this.data.mockDoctors.find(item => item.id === doctorId);
      
      if (doctor) {
        this.setData({
          doctor,
          isLoading: false
        });
      } else {
        wx.showToast({
          title: '医生不存在',
          icon: 'error'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
      
      wx.hideLoading();
    }, 500);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const { doctor } = this.data;
    if (doctor) {
      return {
        title: `${doctor.name} - ${doctor.title}`,
        path: `/pages/doctors/detail?id=${doctor.id}`,
        imageUrl: doctor.avatar
      };
    }
    return {
      title: '心理咨询预约平台',
      path: '/pages/index/index'
    };
  },
  
  // 收藏/取消收藏医生
  toggleFavorite() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip();
      return;
    }
    
    const { doctor, isFavorite } = this.data;
    const favorites = wx.getStorageSync('doctor_favorites') || [];
    
    if (isFavorite) {
      // 取消收藏
      const index = favorites.indexOf(doctor.id);
      if (index > -1) {
        favorites.splice(index, 1);
      }
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      });
    } else {
      // 添加收藏
      favorites.push(doctor.id);
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    }
    
    // 更新本地存储
    wx.setStorageSync('doctor_favorites', favorites);
    
    // 更新页面数据
    this.setData({
      isFavorite: !isFavorite
    });
  },
  
  // 显示登录提示
  showLoginTip() {
    wx.showModal({
      title: '提示',
      content: '请先登录后再操作',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/profile/index'
          });
        }
      }
    });
  },
  
  // 预览证书图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const { doctor } = this.data;
    const urls = doctor.certificates.map(cert => cert.image);
    
    wx.previewImage({
      current: url,
      urls
    });
  },
  
  // 查看全部评价
  viewAllReviews() {
    const { doctor } = this.data;
    wx.navigateTo({
      url: `/pages/doctors/reviews?id=${doctor.id}`
    });
  },
  
  // 导航到预约页面
  navigateToAppointment(e) {
    if (!this.data.isLoggedIn) {
      this.showLoginTip();
      return;
    }
    
    const { doctor } = this.data;
    wx.navigateTo({
      url: `/pages/appointment/create?doctorId=${doctor.id}`
    });
  },
  
  // 云函数调用封装（实际项目中使用）
  callCloudFunction(name, data) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name,
        data,
        success: res => {
          resolve(res.result);
        },
        fail: err => {
          console.error(`[云函数] ${name} 调用失败`, err);
          reject(err);
        }
      });
    });
  }
})
