// index.js
Page({
  data: {
    // 推荐医生数据
    recommendDoctors: [
      {
        id: 1,
        name: '张医生',
        title: '国家二级心理咨询师',
        field: '心理咨询',
        rating: 4.9,
        avatar: '/images/doctors/doctor1.png'
      },
      {
        id: 2,
        name: '李医生',
        title: '临床心理医师',
        field: '婚姻家庭',
        rating: 4.8,
        avatar: '/images/doctors/doctor2.png'
      },
      {
        id: 3,
        name: '王医生',
        title: '国家一级心理咨询师',
        field: '青少年教育',
        rating: 4.7,
        avatar: '/images/doctors/doctor3.png'
      }
    ],
    // 最新资讯数据
    latestNews: [
      {
        id: 1,
        title: '如何缓解焦虑情绪？专家教你几个小技巧',
        summary: '焦虑是现代人常见的情绪问题，本文将介绍几种有效的缓解方法...',
        image: '/images/news/news1.png',
        date: '2023-05-15',
        views: 1256
      },
      {
        id: 2,
        title: '心理健康与睡眠质量的关系研究',
        summary: '良好的睡眠对心理健康至关重要，研究表明睡眠质量与多种心理问题有关...',
        image: '/images/news/news2.png',
        date: '2023-05-10',
        views: 986
      }
    ]
  },

  onLoad: function() {
    // 页面加载时获取数据
    this.fetchRecommendDoctors();
    this.fetchLatestNews();
  },

  // 获取推荐医生数据
  fetchRecommendDoctors: function() {
    // 实际项目中，这里应该调用云函数获取数据
    // 示例代码仅使用本地数据
    console.log('获取推荐医生数据');
  },

  // 获取最新资讯数据
  fetchLatestNews: function() {
    // 实际项目中，这里应该调用云函数获取数据
    // 示例代码仅使用本地数据
    console.log('获取最新资讯数据');
  },

  // 搜索功能
  onSearch: function(e) {
    const keyword = e.detail.value;
    wx.navigateTo({
      url: `/pages/doctors/list?keyword=${keyword}`
    });
  },

  // 页面跳转
  navigateTo: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  }
});