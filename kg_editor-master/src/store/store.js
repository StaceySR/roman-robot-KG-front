import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const state = {
  log: [],
  dataList: {
    nodes: [
      {id: 'node0', label: 'pop-up market', size: [140, 140], type: 'LOCATIONS', style: {fill: '#5B77AE', stroke: '#4682B4', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}, labelCfg: {position: 'center', style: {fill: '#FFFFFF', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}},
      {id: 'node1', label: 'Cyber-punk', size: [140, 140], type: 'STYLE', style: {fill: '#F4F8D8', stroke: '#F4F8D8', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}, labelCfg: {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}},
      {id: 'node2', label: 'Take Photos', size: [160, 160], type: 'TASK_OBJECTIVE', style: {fill: '#E9E7F6', stroke: '#E9E7F6', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}, labelCfg: {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}},
      {id: 'node3', label: 'Weekends', size: [140, 140], type: 'TIMESTAMP', style: {fill: '#FEEED6', stroke: '#FEEED6', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}, labelCfg: {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}},
      {id: 'node4', label: 'Scissors pose', size: [140, 140], type: 'ACTION_POSTURE', style: {fill: '#FFEEF6', stroke: '#FFEEF6', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}, labelCfg: {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}},
      {id: 'node5', label: 'Trendy man', size: [140, 140], type: 'USER_PROPERTY', style: {fill: '#EDF8FB', stroke: '#EDF8FB', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}, labelCfg: {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}}
    ],
    edges: [
      {source: 'node0', target: 'node2', label: '✅', type: 'line', style: {stroke: '#C0C4CC', lineWidth: 1, startArrow: false, endArrow: true}, labelCfg: {position: 'middle', refX: 0, refY: 0, style: {fill: '#4682B4', fontWeight: 400, opacity: 1, fontFamily: '微软雅黑', fontSize: 24}}},
      {source: 'node0', target: 'node3', label: '✅', type: 'line', style: {stroke: '#C0C4CC', lineWidth: 1, startArrow: false, endArrow: true}, labelCfg: {position: 'middle', refX: 0, refY: 0, style: {fill: '#4682B4', fontWeight: 400, opacity: 1, fontFamily: '微软雅黑', fontSize: 24}}},
      {source: 'node0', target: 'node4', label: '❓', type: 'line', style: {stroke: '#C0C4CC', lineWidth: 1, startArrow: false, endArrow: true}, labelCfg: {position: 'middle', refX: 0, refY: 0, style: {fill: '#4682B4', fontWeight: 400, opacity: 1, fontFamily: '微软雅黑', fontSize: 24}}},
      {source: 'node0', target: 'node5', label: '❓', type: 'line', style: {stroke: '#C0C4CC', lineWidth: 1, startArrow: false, endArrow: true}, labelCfg: {position: 'middle', refX: 0, refY: 0, style: {fill: '#4682B4', fontWeight: 400, opacity: 1, fontFamily: '微软雅黑', fontSize: 24}}},
      {source: 'node5', target: 'node1', label: '', type: 'line', style: {stroke: '#C0C4CC', lineWidth: 1, startArrow: false, endArrow: true}, labelCfg: {position: 'middle', refX: 0, refY: 0, style: {fill: '#4682B4', fontWeight: 400, opacity: 1, fontFamily: '微软雅黑', fontSize: 24}}}
    ]
  }
}

const mutations = {
  updateDataList (state, newDataList) {
    state.dataList = newDataList
  },
  addLog (state, param) { // 存储操作记录
    state.log.unshift(param)
  },
  deleteLog (state) { // 删除操作记录
    state.log.splice(0, 1)
  },
  clearData (state) { // 清空数据
    state.dataList = {
      nodes: [],
      edges: []
    }
  },
  getData (state, param) { // 导入数据
    console.log('getData: param: ', param)
    state.dataList = param
  },
  addNode (state, param) { // 添加节点
    console.log('addNode: ', param)
    state.dataList.nodes.push(param)
  },
  addEdge (state, param) { // 添加连线
    state.dataList.edges.push(param)
  },
  deleteNode (state, param) { // 删除节点
    let index = state.dataList.nodes.findIndex(function (value) {
      if (typeof param === 'string') {
        return value.id === param
      } else {
        return value.id === param.id
      }
    })
    state.dataList.nodes.splice(index, 1)
  },
  deleteEdge (state, param) { // 删除连线
    let index = state.dataList.edges.findIndex(function (value) {
      if (typeof param === 'string') {
        return value.id === param
      } else {
        return value.id === param.id
      }
    })
    state.dataList.edges.splice(index, 1)
  },
  updateNode (state, param) { // 更新节点
    console.log('updateNode: param: ', param)
    if (param.type === 'LOCATIONS') {
      console.log('type: ', param.type)
      param.size = [140, 140]
      param.style = {fill: '#5B77AE', stroke: '#4682B4', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}
      param.labelCfg = {position: 'center', style: {fill: '#FFFFFF', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}
    }
    if (param.type === 'STYLE') {
      console.log('type: ', param.type)
      param.size = [140, 140]
      param.style = {fill: '#F4F8D8', stroke: '#F4F8D8', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}
      param.labelCfg = {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}
    }
    if (param.type === 'TASK_OBJECTIVE') {
      console.log('type: ', param.type)
      param.size = [140, 140]
      param.style = {fill: '#E9E7F6', stroke: '#E9E7F6', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}
      param.labelCfg = {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}
    }
    if (param.type === 'TIMESTAMP') {
      console.log('type: ', param.type)
      param.size = [140, 140]
      param.style = {fill: '#FEEED6', stroke: '#FEEED6', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}
      param.labelCfg = {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}
    }
    if (param.type === 'ACTION_POSTURE') {
      console.log('type: ', param.type)
      param.size = [140, 140]
      param.style = {fill: '#FFEEF6', stroke: '#FFEEF6', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}
      param.labelCfg = {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}
    }
    if (param.type === 'USER_PROPERTY') {
      console.log('type: ', param.type)
      param.size = [140, 140]
      param.style = {fill: '#EDF8FB', stroke: '#EDF8FB', lineWidth: 1, shadowColor: '#909399', shadowBlur: 10, shadowOffsetX: 3, shadowOffsetY: 3}
      param.labelCfg = {position: 'center', style: {fill: '#000000', fontWeight: 800, opacity: 1, fontFamily: '微软雅黑', fontSize: 18}}
    }
    state.dataList.nodes.forEach((item, index) => {
      if (item.id === param.id) {
        state.dataList.nodes[index] = param
      }
    })
  },
  updateEdge (state, param) { // 更新节点
    state.dataList.edges.forEach((item, index) => {
      if (item.id === param.id) {
        state.dataList.edges[index] = param
      }
    })
  }
}

export default new Vuex.Store({
  state, mutations
})
