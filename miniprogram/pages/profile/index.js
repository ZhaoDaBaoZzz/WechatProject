// pages/profile/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoggedIn: false, // 是否已登录
    userInfo: null // 用户信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时检查登录状态，以便及时更新
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo
      });
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: null
      });
    }
  },

  /**
   * 处理登录
   */
  handleLogin() {
    // 显示加载中
    wx.showLoading({
      title: '登录中...'
    });
    
    // 获取用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        // 模拟登录成功，实际应调用云函数获取openid
        const userInfo = {
          ...res.userInfo,
          openid: 'user_' + Math.random().toString(36).substr(2, 9),
          role: 0 // 默认为普通用户
        };
        
        // 保存用户信息到本地
        wx.setStorageSync('userInfo', userInfo);
        
        // 更新页面数据
        this.setData({
          isLoggedIn: true,
          userInfo
        });
        
        wx.hideLoading();
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('登录失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 处理退出登录
   */
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息
          wx.removeStorageSync('userInfo');
          
          // 更新页面数据
          this.setData({
            isLoggedIn: false,
            userInfo: null
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 导航到预约列表
   */
  navigateToAppointment() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip();
      return;
    }
    
    wx.switchTab({
      url: '/pages/appointment/list'
    });
  },

  /**
   * 导航到收藏列表
   */
  navigateToFavorites() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip();
      return;
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 导航到评价列表
   */
  navigateToReviews() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip();
      return;
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 导航到医生申请
   */
  navigateToDoctorApply() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip();
      return;
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 导航到排班管理
   */
  navigateToDoctorSchedule() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 导航到预约管理
   */
  navigateToDoctorAppointments() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 导航到设置页面
   */
  navigateToSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 导航到关于我们
   */
  navigateToAbout() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 显示登录提示
   */
  showLoginTip() {
    wx.showModal({
      title: '提示',
      content: '请先登录后再使用此功能',
      showCancel: false
    });
  }
});