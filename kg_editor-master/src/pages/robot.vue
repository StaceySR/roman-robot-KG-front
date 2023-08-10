<template>
    <div class="container">
      <div class="title-container">
        <div class="title-center">
          <a class="title" href="https://github.com/g0ngjie/antv-x6-vue2">{{titleData.title}}</a>
        </div>
        <div class="title-buttons">
          <button class="title-button">
            <img class="title-button-img2" src="../../static/assets/play.png"/>
          </button>
        </div>
      </div>
      <div>
        <img id="episode-image" src="../experiment/episodeImages/KFC.jpg">
      </div>
      <div class="inner-container">
        <div class="episode-features">
            <label>User&Property: </label>
            <input id="user-property" type="text" placeholder="Feature 1">
            <label>Task objective: </label>
            <input id="task-objective" type="text" placeholder="Feature 2">
            <label>Style: </label>
            <input id="style" type="text" placeholder="Feature 3">
            <label>TimeStamp: </label>
            <input id="timestamp" type="text" placeholder="Feature 4">
        </div>
        <div class="questions">
            <input id="questions" type="text" placeholder="Question">
        </div>
        <div class="search-relate-node">
            <button @click="learnNewEpisode">Learn</button>
            <button @click="searchNewRelateNode">Search</button>
        </div>
        <div class="answers">
            <label>answers: </label>
            <label class="answers-content"></label>
        </div>
      </div>
    </div>
  </template>

<script>
import Vue from 'vue' // 导入 Vue 对象，用于创建响应式数据
import Axios from 'axios'
import { findClosestImages } from '../utils/mostSimilarImages'

export default {
  components: {
  },
  data () {
    return {
      titleData: Vue.observable({
        title: 'ROBOT UI'
      }),
      newTitleData: '',
      userProperty: '',
      taskObjective: '',
      style: '',
      timeStamp: '',
      question: '',
      episodeData: {},
      socket: null,
      episodeVectorList: [],
      nodeSyle: {
        'USER_PROPERTY': {fill: '#EDF8FB', stroke: '#EDF8FB', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3},
        'TASK_OBJECTIVE': {fill: '#E9E7F6', stroke: '#E9E7F6', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3},
        'STYLE': {fill: '#F4F8D8', stroke: '#F4F8D8', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3},
        'TIMESTAMP': {fill: '#FEEED6', stroke: '#FEEED6', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3},
        'ACTION_POSTURE': {fill: '#FFEEF6', stroke: '#FFEEF6', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3},
        'LOCATIONS': {fill: '#5B77AE', stroke: '#4682B4', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}
      },
      nodeLabelStyle: {
        'USER_PROPERTY': {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}},
        'TASK_OBJECTIVE': {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}},
        'STYLE': {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}},
        'TIMESTAMP': {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}},
        'ACTION_POSTURE': {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}},
        'LOCATIONS': {position: 'center', style: {fill: '#FFFFFF', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}
      }
    }
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    dataProcessTimestamp (timeStamp) {
      // 获取系统当前时间 timestamp = new Date();
      timeStamp = new Date()
      const currentDate = timeStamp

      // 提取当前星期（0表示周日，1表示周一，依此类推）
      const currentWeekday = currentDate.getDay()

      // 判断是工作日还是周末
      let dayType
      if (currentWeekday === 0 || currentWeekday === 6) {
        // dayType = 'weekend';
        dayType = [0]
      } else {
        // dayType = 'weekday';
        dayType = [1]
      }

      // const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const weekdayName = [[0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0]]
      const currentWeekdayName = weekdayName[currentWeekday]

      const currentHour = currentDate.getHours()

      let period
      if (currentHour >= 6 && currentHour < 11) {
        // period = '上午';
        period = [0, 0]
      } else if (currentHour >= 11 && currentHour < 13) {
        // period = '中午';
        period = [0, 1]
      } else if (currentHour >= 13 && currentHour < 17) {
        // period = '下午';
        period = [1, 0]
      } else {
        // period = '晚上';
        period = [1, 1]
      }

      // 以向量形式返回 dayType: 2类。 weekdayName: 7类。 period: 4类。
      // const vectorTimestamp = dayType + currentWeekdayName + period
      const vectorTimestamp = [...dayType, ...currentWeekdayName, ...period]
      return vectorTimestamp
    },
    dataProcessUser (user) {
      // user = {type: 'xxx', sex: '男/女'}
      let userType = {
        '时尚潮流青年': [0, 0, 0, 0],
        '文艺青年': [0, 0, 0, 1],
        '运动达人': [0, 0, 1, 0],
        '商务精英': [0, 0, 1, 1],
        '甜美可爱学生': [0, 1, 0, 0],
        '低龄儿童': [0, 1, 0, 1],
        '银发族': [0, 1, 1, 0],
        '精神中年': [0, 1, 1, 1]
      }
      let sexType = {
        '男': [0],
        '女': [1]
      }
      // return userType[user.type] + sexType[user.sex]
      return [...userType[user.type], ...sexType[user.sex]]
      // ... 这些类别是常见商场顾客划分，初始化 + 管理员审核、修改
    },
    dataProcessUserStyle (style) {
      let styleType = {
        '潮流风': [0, 0, 0, 0, 0],
        '自然风': [0, 0, 0, 0, 1],
        '复古风': [0, 0, 0, 1, 0],
        '运动风': [0, 0, 0, 1, 1],
        '摇滚风': [0, 0, 1, 0, 0],
        '民族风': [0, 0, 1, 0, 1],
        '青春风': [0, 0, 1, 1, 0],
        '可爱风': [0, 0, 1, 1, 1],
        '知性风': [0, 1, 0, 0, 0],
        '简约风': [0, 1, 0, 0, 1]
      }
      return styleType[style]
    },
    dataProcessTask (task) {
      return task
    },
    dataProcessUserAction (action) {
      return action
    },
    episodeDataProcess (episodeData) {
      // episodeData= {timestamp: xxx, userProperty: xxx, ...}
      episodeData.TimeStamp = this.dataProcessTimestamp(episodeData.TimeStamp)
      episodeData.userProperty = this.dataProcessUser(episodeData.userProperty)
      episodeData.style = this.dataProcessUserStyle(episodeData.style)
      episodeData.taskObjective = this.dataProcessTask(episodeData.taskObjective)
      episodeData.actionPosture = this.dataProcessUserAction(episodeData.actionPosture)

      console.log('episodeData: ', episodeData)

      // 首先把episodeData的各项元素除了keyframe的向量组拼接起来
      const episodeOtherVector = [...episodeData.TimeStamp, ...episodeData.userProperty, ...episodeData.style]
      console.log('episodeOtherVector: ', episodeOtherVector)
      return episodeOtherVector

      // 如果我在计算em vector的时候只对关键帧计算向量，而不涉及到具体的time\user等细粒度信息
      // 等到之后要求取重合项的时候再考虑time\user等这些细粒度信息
    },
    async imageVector () {
      // const imagePath = '../experiment/episodeImages/KFC.jpg'
      const imagePath = 'https://youimg1.c-ctrip.com/target/100e0u000000j5hx1ABC9.jpg'

      const apiData = await this.fetchImageVectorData(imagePath)
      console.log('imageVector: ', apiData.features)
      return apiData.features
    },
    // step1
    async EMEncoder (episodeData) {
      // TODO: 实现将Episode Data转换为EM Vector的逻辑
      const vector = await this.imageVector(episodeData.keyframeImage)
      if (vector) {
        const emVector = [...this.episodeDataProcess(episodeData), ...vector]
        console.log('emVector: ', emVector)
        return emVector
      } else {
        return null
      }
    },
    // step2
    isSimilarEpisode (targetVector) {
      // 找到与这episode image最相似的3张图象
      // 所有情景图像组成的特征向量集合，每一行代表一个情景图像的特征向量
      const allEMVectors = this.episodeVectorList
      // 示例：假设我们有一个目标图像的特征向量
      // const targetVector = [0.3, 0.4, 0.5, 0.6];
      console.log('isSimilarEpisode: allEMVector: ', allEMVectors)

      return findClosestImages(allEMVectors, targetVector)
    },
    // step3
    async keepSimilarEpisodeInfo (episodeData) {
      // TODO: 实现找到重复出现的Episode Memory及提取特征信息，逐步构建完善的KG
      const targetVector = await this.EMEncoder(episodeData)
      if (this.isSimilarEpisode(targetVector)) {
        console.log('similar episode!')
        console.log('要保存的episodeData: ', episodeData)

        // 同时要将这个episode vector保存至episodeVectorList
        console.log('当前的episodeVectorList: ', this.episodeVectorList)
        this.episodeVectorList.push(targetVector)

        // 保存的时候要去重
        return episodeData
      } else {
        console.log('not similar episode!')
        return null
      }
    },
    async learnNewEpisode () {
      // 先判断能否从该episode中学习得到新知识
      const userPropertyInput = document.getElementById('user-property')
      const taskObjectiveInput = document.getElementById('task-objective')
      const styleInput = document.getElementById('style')
      const timeStampInput = document.getElementById('timestamp')
      const questionInput = document.getElementById('questions')

      this.userProperty = userPropertyInput.value
      this.taskObjective = taskObjectiveInput.value
      this.style = styleInput.value
      this.timeStamp = timeStampInput.value
      this.question = questionInput.value

      // this.episodeData.userProperty = this.userProperty
      this.episodeData.userProperty = {type: '运动达人', sex: '女'}
      // this.episodeData.style = this.style
      this.episodeData.style = '复古风'
      this.episodeData.timeStamp = this.timeStamp
      this.episodeData.taskObjective = this.taskObjective
      this.episodeData.actionPosture = null
      this.episodeData.location = null

      // 学习过程
      const learnEpisodeData = await this.keepSimilarEpisodeInfo(this.episodeData)
      // 定义这次学习过程中要保存的nodeList
      let nodeList = []
      if (learnEpisodeData) {
        console.log('学习到的episode信息：', learnEpisodeData)

        const newNode = {
          'USER_PROPERTY': this.userProperty,
          // 'userProperty': '文艺女青年',
          'TASK_OBJECTIVE': this.taskObjective,
          'STYLE': this.style,
          'TIMESTAMP': this.timeStamp,
          'ACTION_POSTURE': null,
          'LOCATIONS': '商场'
        }

        // 选择把episodeData中的有效节点信息都保存至KG，即不为空的信息
        for (let key in newNode) {
          if (newNode.hasOwnProperty(key) && newNode[key] !== null && newNode[key] !== undefined && newNode[key] !== '') {
            console.log('key: ', key)
            let obj = {
              label: newNode[key],
              size: [140, 140],
              type: key,
              style: this.nodeSyle[key],
              labelCfg: this.nodeLabelStyle[key]
            }
            nodeList.push(obj)
          }
        }

        // 还要对这些节点的连边做处理
        // 1. 关于这些节点是否已经在KG中存在，若存在，则无需再新增；反之，新增
        // 2. 关于一个episodeData的节点之间要互相连接，连接按照一定规则
      }

      // 学习结果--添加新的节点

      // 2. 发现更新的新节点的数据，然后通过 WebSocket 发送消息给服务器
      const ws = new WebSocket('ws://localhost:8081')

      // 发送消息给 server.js，通知它更新 dataList
      ws.onopen = () => {
        const message = {
          type: 'updateDataList',
          payload: nodeList
        }
        ws.send(JSON.stringify(message))
        console.log('ws.send.updateDataList: ', message)
        ws.close()
      }
    },
    searchNewRelateNode () {
      this.learnNewEpisode()
      // search算法

      // 当前KG数据组
      console.log(this.$store.state.dataList)

      // 给出search结果
      // 在这里使用获取到的输入框的值进行处理，并将结果赋值给 answers 变量
      this.answers = '搜索结果' // 例如，这里将结果设置为字符串 "搜索结果"

      // 将结果填充到 answers-content 标签中
      const answersContentLabel = document.querySelector('.answers-content')
      answersContentLabel.textContent = this.answers
    },
    fetchData () {
      Axios.get('http://localhost:8080/api/getEpisodeVectorList')
        .then((response) => {
          // 请求成功，将获取的数据更新到 dataList
          this.episodeVectorList = response.data
          console.log('robot.vue: fetchData success!')
          console.log('fetchData: response.data: ', response.data)
        })
        .catch((error) => {
          console.error('Error fetching data:', error)
        })
    },
    wait (seconds) {
      return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000)
      })
    },
    async fetchImageVectorData (imagePath) {
      try {
        const response = await fetch('http://127.0.0.1:5000/get_feature_vector', {
          method: 'POST',
          // body: formData,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image_url: imagePath })
        })
        if (!response.ok) {
          throw new Error('Request failed')
        }
        const data = await response.json()
        // 在这里处理获取到的数据
        return data
      } catch (error) {
        console.error('Error:', error)
        // 处理错误情况
        return null // 或者返回适当的默认值
      }
    }
  }
}

</script>

  <style>
  .test-button {
    position:absolute;
    left: 0px;
    top: 10px;
  }
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .inner-container {
    display: flex;
    flex: 1; /* take up all remaining space */
    height: 95%;
  }
  .title-container {
    display: flex;
    justify-content: space-between; /* 将内容左中右横向排布 */
    align-items: center; /* 垂直方向居中对齐 */
    text-align: center;
    padding: 3px;
    background-color: #5AB2B8;
    height: 5%;

  }
  .title-center {
    flex: 1; /* 自动占据剩余的空间 */
    text-align: center; /* 文字居中 */
  }
  .title-buttons {
    display: flex;
    justify-content: flex-end; /* 将按钮放置在容器的右侧 */
    align-items: center; /* 垂直居中按钮 */
  }
  .title-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    margin-right: 20px;
    /* width: 30px;
    height: 30px; */
  }
  /* 图片样式可以根据需要设置宽高等 */
  .title-button img {
    position: relative;
    top: 2px;
    width: 32px;
    height: 32px;
  }
  .title-button:hover{
    transform: scale(1.1) !important;
  }

  a.title {
    text-decoration: none;
    color: #FFF;
    font-family: Avenir;
    font-size: 18px;
    font-style: normal;
    font-weight: 800;
    line-height: normal;
    align-items: center; /* 垂直方向居中对齐标题 */
  }

  a.title:hover {
    text-decoration: underline;
  }
.episodeImage {
  width: 200px;
  height: 200px;
}
img{
  width: 200px;
  height: 200px;
}
.inner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 添加此行代码 */
  text-align: center; /* 添加此行代码 */
  height: 100vh; /* 可选，使容器铺满整个视口 */
  width: 100%;
}

.episode-features,
.questions,
.search-relate-node {
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
}

.episode-features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 2000px;
}

.episode-features input[type="text"]{
  width: 100%;
  max-width: 180px;
  padding: 10px;
  margin: 0 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.questions input[type="text"] {
  width: 100%;
  max-width: 500px;
  padding: 10px;
  margin: 0 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-relate-node button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}

.search-relate-node button:hover {
  background-color: #0069d9;
}
.answers-content{
    color: red;
}
  </style>
