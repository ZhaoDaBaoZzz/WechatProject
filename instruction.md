# 心理预约平台小程序产品需求文档（PRD）

---

## 一、产品概述  
**定位**：基于微信生态的心理咨询服务预约平台（个人主体类小程序）  
**核心能力**：  
- 医生信息展示与预约管理  
- 活动资讯发布与传播  
- 多角色权限控制（普通用户/医生/管理员）  
- 轻量化数据管理（微信云开发实现）  

---

## 二、用户角色定义  
| 角色         | 权限说明                     |
| ------------ | ---------------------------- |
| **普通用户** | 查看信息、预约医生、参与活动 |
| **医生用户** | 管理预约订单、接收微信通知   |
| **管理员**   | 内容管理、用户审核、数据看板 |

---

## 三、核心功能逻辑  
### 1. 主页（Index）  
**1.1 Banner轮播图**  
- **逻辑**：从云存储调用图片URL，管理员通过后台替换图片文件实现更新  
- **补充细节**：  
  - 支持最多5张轮播图  
  - 图片尺寸强制裁剪为750*300px（适配主流机型）  

**1.2 最新活动**  
- **逻辑**：按发布时间倒序展示前3条活动  
- **交互**：点击跳转至活动详情页  

**1.3 快速预约**  
- **逻辑**：  
  - 展示通过"推荐权重"排序的前3位医生（权重=预约成功率×评分）  
  - 点击医生卡片跳转至医生详情页  
- **补充**：  
  - 医生离线状态自动隐藏  
  - 显示医生实时可预约状态标识  

---

### 2. 医生模块  
**2.1 医生列表页**  
- **筛选维度**：  
  - 专业领域（心理咨询/婚姻家庭/青少年教育等）  
  - 职称（国家二级咨询师/临床心理医师等）  
- **搜索逻辑**：支持姓名模糊匹配（云数据库正则查询）  

**2.2 医生详情页**  
- **核心信息**：  
  - 资质证书（云存储图片）  
  - 用户评价系统（评分+文字评价）  
  - 历史服务数据（成功案例数）  

**2.3 预约流程**  
- **状态机设计**：  
  ```mermaid
  graph LR
    A[用户提交] --> B{医生响应}
    B -->|接受| C[生成缴费二维码]
    B -->|拒绝| D[释放预约资格]
    C --> E[服务完成]
  ```
- **防冲突机制**：  
  - 同一时段只能存在1个有效预约  
  - 医生端可设置每日最大接单量  

---

### 3. 活动模块  
**3.1 数据表关键字段**  
```javascript
{
  title: "心理健康讲座",
  location: "成都", // 枚举值：成都/重庆
  cover: "cloud://xxx.jpg", // 缩略图
  content: "<HTML富文本>",
  qrCode: "cloud://payment_qr.jpg", // 缴费二维码
  startTime: "2024-03-20T14:00:00",
  status: 1 // 0-已结束 1-进行中
}
```

**3.2 过期处理**：  
- 自动过滤结束时间超过7天的活动  
- 管理员可手动归档历史活动  

---

### 4. 个人中心  
**4.1 登录体系**  
- **微信授权**：仅收集`openid`和`头像+昵称`  
- **隐私保护**：  
  - 医生不可查看用户完整手机号  
  - 评价系统采用匿名展示  

**4.2 角色切换逻辑**  
- **医生申请流程**：  
  ```mermaid
  graph TB
    A[提交资质证明] --> B[管理员审核]
    B -->|通过| C[更新user表role字段]
    B -->|拒绝| D[站内信通知]
  ```
- **权限控制**：  
  - 医生端隐藏其他医生的预约数据  
  - 管理员操作记录留痕  

---

## 四、数据表设计（云数据库）  
### 1. 用户表（users）  
| 字段        | 类型   | 说明                       |
| ----------- | ------ | -------------------------- |
| _openid     | string | 微信唯一标识               |
| role        | number | 0-普通用户 1-医生 2-管理员 |
| profile     | object | {name, avatar, mobile}     |
| applyStatus | number | 0-未申请 1-审核中 2-已通过 |

### 2. 医生表（doctors）  
| 字段      | 类型   | 说明                      |
| --------- | ------ | ------------------------- |
| userId    | string | 关联users._openid         |
| specialty | array  | ["青少年心理","职场压力"] |
| schedule  | object | 可预约时段配置            |
| rating    | number | 评价得分（1-5分）         |

### 3. 预约表（orders）  
| 字段            | 类型   | 说明                                |
| --------------- | ------ | ----------------------------------- |
| doctorId        | string | 关联doctors._id                     |
| userId          | string | 关联users._openid                   |
| status          | number | 0-待确认 1-已接受 2-已完成 3-已取消 |
| appointmentTime | date   | 预约具体时间                        |

---

## 五、补充设计细节  
1. **消息通知体系**：  
   - 采用微信模板消息（服务通知）  
   - 关键节点：预约申请提交、医生接单、预约前1小时提醒  

2. **安全机制**：  
   - 云数据库权限设置为"仅管理员可写"  
   - 敏感操作（如角色变更）需要管理员二次确认  

3. **体验优化**：  
   - 列表页加载骨架屏  
   - 首次预约成功赠送咨询手册（PDF文件）  

4. **管理后台设计**：  
   - 批量导出预约数据（CSV格式）  
   - 医生排班可视化日历  

---

**版本规划**：  
- V1.0：实现基础预约流程  
- V2.0：增加视频咨询能力  
- V3.0：对接第三方心理测评工具  

---

> 该文档已覆盖微信云开发的实现约束，如需技术方案细节可进一步补充。