# 心理预约平台云数据库设计

## 数据库结构设计

### 1. 用户表（users）

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 文档ID，系统自动生成 |
| _openid | string | 用户微信唯一标识 |
| role_id | string | 角色ID，关联roles表 |
| name | string | 用户姓名 |
| avatar | string | 头像URL |
| mobile | string | 手机号码 |
| gender | number | 性别：0-未知，1-男，2-女 |
| create_time | date | 创建时间 |
| update_time | date | 更新时间 |
| last_login_time | date | 最后登录时间 |
| status | number | 状态：0-禁用，1-正常 |

### 2. 角色表（roles）

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 文档ID，系统自动生成 |
| name | string | 角色名称 |
| code | string | 角色编码：user-普通用户，doctor-医生，admin-管理员 |
| description | string | 角色描述 |
| status | number | 状态：0-禁用，1-正常 |
| create_time | date | 创建时间 |
| update_time | date | 更新时间 |

### 3. 权限表（permissions）

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 文档ID，系统自动生成 |
| name | string | 权限名称 |
| code | string | 权限编码 |
| description | string | 权限描述 |
| type | number | 权限类型：1-菜单，2-按钮，3-接口 |
| parent_id | string | 父权限ID |
| status | number | 状态：0-禁用，1-正常 |
| create_time | date | 创建时间 |
| update_time | date | 更新时间 |

### 4. 角色权限关联表（role_permissions）

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 文档ID，系统自动生成 |
| role_id | string | 角色ID |
| permission_id | string | 权限ID |
| create_time | date | 创建时间 |

### 5. 医生表（doctors）

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 文档ID，系统自动生成 |
| user_id | string | 用户ID，关联users表 |
| title | string | 职称：国家二级心理咨询师、国家一级心理咨询师、临床心理医师、精神科医师等 |
| field | string | 专业领域：心理咨询、婚姻家庭、青少年教育、抑郁症、焦虑症等 |
| skills | array | 擅长技能 |
| experience | number | 从业年限 |
| description | string | 个人简介 |
| avatar | string | 头像URL |
| rating | number | 评分（1-5分） |
| rating_count | number | 评分人数 |
| case_count | number | 案例数量 |
| appointment_count | number | 预约次数 |
| response_rate | number | 响应率 |
| price | number | 咨询价格（元/小时） |
| status | number | 状态：0-离线，1-在线 |
| create_time | date | 创建时间 |
| update_time | date | 更新时间 |

### 6. 医生认证表（doctor_certifications）

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| _id | string | 文档ID，系统自动生成 |
| doctor_id | string | 医生ID，关联doctors表 |
| name | string | 证书名称 |
| image | string | 证书图片URL |
| issue_date | date | 发证日期 |
| expiry_date | date | 有效期 |
| status | number | 状态：0-未审核，1-已通过，2-已拒绝 |
| create_time | date | 创建时间 |
| update_time | date | 更新时间 |
| remark | string | 备注 |

## 数据关系

1. 用户(users) 1:1 医生(doctors)：一个用户可以申请成为一个医生
2. 角色(roles) 1:N 用户(users)：一个角色可以分配给多个用户
3. 角色(roles) N:M 权限(permissions)：通过角色权限关联表(role_permissions)实现多对多关系
4. 医生(doctors) 1:N 医生认证(doctor_certifications)：一个医生可以上传多个认证证书

## 初始数据

### 角色初始数据

```javascript
[
  {
    name: "普通用户",
    code: "user",
    description: "可以查看信息、预约医生、参与活动",
    status: 1
  },
  {
    name: "医生",
    code: "doctor",
    description: "可以管理预约订单、接收微信通知",
    status: 1
  },
  {
    name: "管理员",
    code: "admin",
    description: "可以进行内容管理、用户审核、查看数据看板",
    status: 1
  }
]
```

### 权限初始数据（部分示例）

```javascript
[
  {
    name: "用户管理",
    code: "user:view",
    description: "查看用户列表",
    type: 1,
    status: 1
  },
  {
    name: "医生审核",
    code: "doctor:audit",
    description: "审核医生认证申请",
    type: 2,
    status: 1
  },
  {
    name: "预约管理",
    code: "appointment:manage",
    description: "管理预约信息",
    type: 3,
    status: 1
  }
]
```