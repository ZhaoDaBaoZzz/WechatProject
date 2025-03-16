// pages/doctors/list.js
Page({
  data: {
    doctors: [], // 所有医生数据
    filteredDoctors: [], // 筛选后的医生数据
    keyword: '', // 搜索关键词
    currentField: '', // 当前选中的专业领域
    currentTitle: '', // 当前选中的职称
    currentExperience: '', // 当前选中的经验年限
    isOnline: false, // 是否只显示在线医生
    isFavoriteFilter: false, // 是否只显示收藏的医生
    fieldOptions: ['心理咨询', '婚姻家庭', '青少年教育', '抑郁症', '焦虑症'], // 专业领域选项
    titleOptions: ['国家二级心理咨询师', '国家一级心理咨询师', '临床心理医师', '精神科医师'], // 职称选项
    experienceOptions: ['3年以下', '3-5年', '5-10年', '10年以上'], // 经验年限选项
    sortOptions: ['综合排序', '评分最高', '经验最丰富', '价格最低'], // 排序选项
    currentSort: '综合排序', // 当前排序方式
    page: 1, // 当前页码
    pageSize: 10, // 每页数量
    hasMore: true, // 是否有更多数据
    isLoading: false, // 是否正在加载
    favorites: [], // 收藏的医生ID列表
    isLoggedIn: false, // 是否已登录
    // 模拟数据
    mockDoctors: [
      {
        id: 1,
        name: '张医生',
        title: '国家二级心理咨询师',
        field: '心理咨询',
        rating: 4.9,
        experience: 5,
        description: '擅长各类心理问题咨询，包括情绪管理、人际关系、自我成长等方面。',
        avatar: '/images/doctors/doctor1.png'
      },
      {
        id: 2,
        name: '李医生',
        title: '临床心理医师',
        field: '婚姻家庭',
        rating: 4.8,
        experience: 8,
        description: '专注于婚姻家庭咨询，擅长处理夫妻关系、亲子关系等家庭问题。',
        avatar: '/images/doctors/doctor2.png'
      },
      {
        id: 3,
        name: '王医生',
        title: '国家一级心理咨询师',
        field: '青少年教育',
        rating: 4.7,
        experience: 10,
        description: '专注于青少年心理健康，擅长处理学习压力、叛逆行为等青少年问题。',
        avatar: '/images/doctors/doctor3.png'
      },
      {
        id: 4,
        name: '赵医生',
        title: '精神科医师',
        field: '抑郁症',
        rating: 4.9,
        experience: 12,
        description: '擅长抑郁症、焦虑症等精神疾病的诊断与治疗，注重药物治疗与心理治疗相结合。',
        avatar: '/images/doctors/doctor4.png'
      },
      {
        id: 5,
        name: '钱医生',
        title: '国家二级心理咨询师',
        field: '焦虑症',
        rating: 4.6,
        experience: 6,
        description: '专注于焦虑障碍的治疗，擅长认知行为疗法，帮助来访者缓解焦虑症状。',
        avatar: '/images/doctors/doctor5.png'
      }
    ]
  },

  onLoad: function(options) {
    // 获取页面参数
    if (options.keyword) {
      this.setData({
        keyword: options.keyword
      });
    }
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 获取收藏的医生列表
    this.getFavorites();
    
    // 加载医生数据
    this.loadDoctors();
  },
  
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 重置页码
    this.setData({
      page: 1,
      hasMore: true
    });
    
    // 重新加载数据
    this.loadDoctors();
  },
  
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // 加载更多数据
    this.loadMore();
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 检查登录状态和收藏状态，以便在返回页面时更新
    this.checkLoginStatus();
    this.getFavorites();
  },

  // 检查登录状态
  checkLoginStatus: function() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      isLoggedIn: !!userInfo
    });
  },
  
  // 获取收藏的医生列表
  getFavorites: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      this.setData({
        favorites: []
      });
      return;
    }
    
    // 从本地存储获取收藏列表
    const favorites = wx.getStorageSync('doctor_favorites') || [];
    this.setData({
      favorites
    });
  },
  
  // 加载医生数据
  loadDoctors: function() {
    this.setData({
      isLoading: true
    });

    // 构建查询条件
    const { keyword, currentField, currentTitle, currentExperience, page, pageSize, currentSort, isOnline } = this.data;
    
    // 实际项目中，这里应该调用云函数获取数据
    // 示例代码使用模拟数据，但模拟真实的云函数调用逻辑
    wx.showLoading({
      title: '加载中'
    });
    
    // 模拟云函数调用
    setTimeout(() => {
      // 模拟分页逻辑
      let result = [...this.data.mockDoctors];
      
      // 模拟根据条件筛选
      if (currentField) {
        result = result.filter(doctor => doctor.field === currentField);
      }
      
      if (currentTitle) {
        result = result.filter(doctor => doctor.title === currentTitle);
      }
      
      if (currentExperience) {
        // 根据经验年限筛选
        switch(currentExperience) {
          case '3年以下':
            result = result.filter(doctor => doctor.experience < 3);
            break;
          case '3-5年':
            result = result.filter(doctor => doctor.experience >= 3 && doctor.experience <= 5);
            break;
          case '5-10年':
            result = result.filter(doctor => doctor.experience > 5 && doctor.experience <= 10);
            break;
          case '10年以上':
            result = result.filter(doctor => doctor.experience > 10);
            break;
        }
      }
      
      // 模拟排序逻辑
      switch(currentSort) {
        case '评分最高':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case '经验最丰富':
          result.sort((a, b) => b.experience - a.experience);
          break;
        case '价格最低':
          // 假设有price字段
          result.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        default:
          // 综合排序：评分*0.6 + 经验*0.4
          result.sort((a, b) => {
            const scoreA = a.rating * 0.6 + a.experience * 0.04;
            const scoreB = b.rating * 0.6 + b.experience * 0.04;
            return scoreB - scoreA;
          });
      }
      
      // 模拟分页
      const start = (page - 1) * pageSize;
      const end = page * pageSize;
      const pageData = result.slice(start, end);
      
      // 更新数据
      this.setData({
        doctors: page === 1 ? pageData : [...this.data.doctors, ...pageData],
        isLoading: false,
        hasMore: end < result.length
      });
      
      this.filterDoctors();
      wx.hideLoading();
      
      // 停止下拉刷新
      wx.stopPullDownRefresh();
    }, 500);
  },

  // 筛选医生数据
  filterDoctors: function() {
    const { doctors, keyword, isFavoriteFilter, favorites } = this.data;
    
    let filtered = [...doctors];
    
    // 关键词筛选
    if (keyword) {
      filtered = filtered.filter(doctor => 
        doctor.name.includes(keyword) || 
        doctor.description.includes(keyword)
      );
    }
    
    // 收藏筛选
    if (isFavoriteFilter && this.data.isLoggedIn) {
      filtered = filtered.filter(doctor => favorites.includes(doctor.id));
    }
    
    this.setData({
      filteredDoctors: filtered
    });
  },

  // 关键词变化
  onKeywordChange: function(e) {
    this.setData({
      keyword: e.detail.value
    });
    this.filterDoctors();
  },

  // 搜索
  onSearch: function() {
    // 重置页码并重新加载数据
    this.setData({
      page: 1
    });
    this.loadDoctors();
  },

  // 专业领域筛选
  onFilterField: function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      currentField: field,
      page: 1 // 重置页码
    });
    this.loadDoctors(); // 重新加载数据
  },

  // 职称筛选
  onFilterTitle: function(e) {
    const title = e.currentTarget.dataset.title;
    this.setData({
      currentTitle: title,
      page: 1 // 重置页码
    });
    this.loadDoctors(); // 重新加载数据
  },
  
  // 经验年限筛选
  onFilterExperience: function(e) {
    const experience = e.currentTarget.dataset.experience;
    this.setData({
      currentExperience: experience,
      page: 1 // 重置页码
    });
    this.loadDoctors(); // 重新加载数据
  },
  
  // 排序方式切换
  onSortChange: function(e) {
    const sort = e.currentTarget.dataset.sort;
    this.setData({
      currentSort: sort,
      page: 1 // 重置页码
    });
    this.loadDoctors(); // 重新加载数据
  },
  
  // 切换是否只显示在线医生
  toggleOnlineFilter: function() {
    this.setData({
      isOnline: !this.data.isOnline,
      page: 1 // 重置页码
    });
    this.loadDoctors(); // 重新加载数据
  },
  
  // 切换是否只显示收藏的医生
  toggleFavoriteFilter: function() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip();
      return;
    }
    
    this.setData({
      isFavoriteFilter: !this.data.isFavoriteFilter
    });
    this.filterDoctors();
  },
  
  // 显示登录提示
  showLoginTip: function() {
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

  // 加载更多
  loadMore: function() {
    if (this.data.isLoading || !this.data.hasMore) return;
    
    this.setData({
      page: this.data.page + 1,
      isLoading: true
    });
    
    // 调用加载医生数据函数
    this.loadDoctors();
  },
  
  // 收藏/取消收藏医生
  toggleFavorite: function(e) {
    if (!this.data.isLoggedIn) {
      this.showLoginTip();
      return;
    }
    
    const doctorId = e.currentTarget.dataset.id;
    const favorites = [...this.data.favorites];
    const index = favorites.indexOf(doctorId);
    
    if (index > -1) {
      // 取消收藏
      favorites.splice(index, 1);
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      });
    } else {
      // 添加收藏
      favorites.push(doctorId);
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    }
    
    // 更新本地存储
    wx.setStorageSync('doctor_favorites', favorites);
    
    // 更新页面数据
    this.setData({
      favorites
    });
    
    // 如果当前是收藏筛选模式，需要重新筛选
    if (this.data.isFavoriteFilter) {
      this.filterDoctors();
    }
  },

  // 跳转到医生详情页
  navigateToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/doctors/detail?id=${id}`
    });
  },
  
  // 检查医生是否已收藏
  isFavorite: function(doctorId) {
    return this.data.favorites.includes(doctorId);
  },
  
  // 云函数调用封装（实际项目中使用）
  callCloudFunction: function(name, data) {
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