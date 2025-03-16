// pages/appointment/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'upcoming', // 当前激活的标签页：upcoming-即将到来，past-历史预约
    appointments: [], // 预约列表
    statusMap: {
      0: { text: '待确认', class: 'pending' },
      1: { text: '已确认', class: 'confirmed' },
      2: { text: '已完成', class: 'completed' },
      3: { text: '已取消', class: 'cancelled' }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 如果有传入的标签页参数，则切换到对应标签页
    if (options.tab) {
      this.setData({ activeTab: options.tab });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 加载预约数据
    this.loadAppointments();
  },

  /**
   * 切换标签页
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    
    // 重新加载对应标签页的数据
    this.loadAppointments();
  },

  /**
   * 加载预约数据
   */
  loadAppointments() {
    // 显示加载中
    wx.showLoading({
      title: '加载中...'
    });
    
    // 模拟从云数据库获取数据
    setTimeout(() => {
      // 获取当前用户
      const userInfo = wx.getStorageSync('userInfo');
      
      if (!userInfo) {
        // 用户未登录
        this.setData({ appointments: [] });
        wx.hideLoading();
        return;
      }
      
      // 模拟预约数据
      const now = new Date();
      const mockAppointments = [
        {
          id: '1',
          doctorId: '101',
          userId: userInfo.openid || 'user123',
          date: '2024-04-15',
          timeSlot: '10:00-11:00',
          consultType: 'online',
          problem: '工作压力大，经常失眠',
          status: 0, // 待确认
          createTime: now.getTime() - 86400000, // 昨天
          doctor: {
            name: '张医生',
            avatar: 'https://placekitten.com/200/200',
            title: '心理咨询师 | 国家二级心理咨询师'
          }
        },
        {
          id: '2',
          doctorId: '102',
          userId: userInfo.openid || 'user123',
          date: '2024-04-20',
          timeSlot: '15:00-16:00',
          consultType: 'offline',
          problem: '家庭关系紧张，需要调解建议',
          status: 1, // 已确认
          createTime: now.getTime() - 172800000, // 前天
          doctor: {
            name: '李医生',
            avatar: 'https://placekitten.com/201/201',
            title: '婚姻家庭咨询师 | 高级心理咨询师'
          }
        },
        {
          id: '3',
          doctorId: '103',
          userId: userInfo.openid || 'user123',
          date: '2024-03-10',
          timeSlot: '14:00-15:00',
          consultType: 'online',
          problem: '青少年叛逆期管理问题',
          status: 2, // 已完成
          createTime: now.getTime() - 2592000000, // 30天前
          doctor: {
            name: '王医生',
            avatar: 'https://placekitten.com/202/202',
            title: '青少年心理咨询师 | 心理学博士'
          }
        },
        {
          id: '4',
          doctorId: '104',
          userId: userInfo.openid || 'user123',
          date: '2024-03-05',
          timeSlot: '16:00-17:00',
          consultType: 'offline',
          problem: '职场人际关系处理',
          status: 3, // 已取消
          createTime: now.getTime() - 3456000000, // 40天前
          doctor: {
            name: '赵医生',
            avatar: 'https://placekitten.com/203/203',
            title: '职场心理咨询师 | 人力资源管理师'
          }
        }
      ];
      
      // 处理预约数据，添加状态文本和样式类
      const processedAppointments = mockAppointments.map(item => {
        const statusInfo = this.data.statusMap[item.status];
        return {
          ...item,
          statusText: statusInfo.text,
          statusClass: statusInfo.class
        };
      });
      
      // 根据当前标签页筛选数据
      const appointmentDate = new Date();
      const filteredAppointments = processedAppointments.filter(item => {
        const itemDate = new Date(item.date);
        if (this.data.activeTab === 'upcoming') {
          // 即将到来：日期在今天或之后，且状态不是已完成或已取消
          return (itemDate >= appointmentDate && (item.status === 0 || item.status === 1));
        } else {
          // 历史预约：日期在今天之前，或状态是已完成或已取消
          return (itemDate < appointmentDate || item.status === 2 || item.status === 3);
        }
      });
      
      // 更新数据
      this.setData({ appointments: filteredAppointments });
      
      wx.hideLoading();
    }, 1000);
  },

  /**
   * 取消预约
   */
  cancelAppointment(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          // 显示加载中
          wx.showLoading({
            title: '处理中...'
          });
          
          // 模拟取消预约操作
          setTimeout(() => {
            // 更新本地数据
            const appointments = this.data.appointments.map(item => {
              if (item.id === id) {
                return {
                  ...item,
                  status: 3, // 已取消
                  statusText: this.data.statusMap[3].text,
                  statusClass: this.data.statusMap[3].class
                };
              }
              return item;
            });
            
            this.setData({ appointments });
            
            wx.hideLoading();
            wx.showToast({
              title: '已取消预约',
              icon: 'success'
            });
            
            // 重新加载数据
            setTimeout(() => {
              this.loadAppointments();
            }, 1500);
          }, 1000);
        }
      }
    });
  },

  /**
   * 开始咨询
   */
  startConsultation(e) {
    const id = e.currentTarget.dataset.id;
    const appointment = this.data.appointments.find(item => item.id === id);
    
    if (appointment.consultType === 'online') {
      // 线上咨询，跳转到聊天页面
      wx.showToast({
        title: '即将跳转到聊天页面',
        icon: 'none'
      });
      
      // 实际应跳转到聊天页面
      // wx.navigateTo({
      //   url: `/pages/chat/index?doctorId=${appointment.doctorId}&appointmentId=${id}`
      // });
    } else {
      // 线下面诊，显示医生地址信息
      wx.showModal({
        title: '面诊信息',
        content: '请按照预约时间前往医生诊室：成都市武侯区天府大道北段1700号环球中心E2-1001',
        showCancel: false
      });
    }
  },

  /**
   * 评价医生
   */
  writeReview(e) {
    const id = e.currentTarget.dataset.id;
    const appointment = this.data.appointments.find(item => item.id === id);
    
    // 跳转到评价页面
    wx.showToast({
      title: '即将跳转到评价页面',
      icon: 'none'
    });
    
    // 实际应跳转到评价页面
    // wx.navigateTo({
    //   url: `/pages/review/create?doctorId=${appointment.doctorId}&appointmentId=${id}`
    // });
  },

  /**
   * 跳转到医生列表
   */
  navigateToDoctor() {
    wx.switchTab({
      url: '/pages/doctors/list'
    });
  }
});