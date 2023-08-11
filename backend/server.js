const fs = require('fs');
const WebSocket = require('ws');
const express = require('express');
const app = express();
const port = 8080;
const cors = require('cors'); // 引入 cors 模块
app.use(cors()); // 使用 cors 中间件允许跨域请求

// 读取 data.txt 文件中的数据作为初始 dataList
let dataList = [];

// 读取 data.txt 文件内容，存入dataList
try {
  const data = fs.readFileSync('./data/data.txt', 'utf8');

  // 将读取的内容解析为 JSON 格式，并赋值给 dataList 变量
  dataList = JSON.parse(data);

  // console.log('Read data from data.txt:', dataList);
} catch (error) {
  console.error('Error reading data from data.txt:', error);
}

let episodeVectorList = [];
// 读取 episodeVectors.txt 文件内容，存入episodeVectors
try {
  const data = fs.readFileSync('./data/episodeVectors.txt', 'utf8')

  // 将读取的内容解析为 JSON 格式，并赋值给 dataList 变量
  episodeVectorList = JSON.parse(data)

  console.log('Read episodeVectors from episodeVectors.txt:', episodeVectorList)
} catch (error) {
  console.error('Error reading data from episodeVectors.txt:', error)
}

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  console.log('Client connected.');

  ws.on('message', (message) => {
    console.log('Received message:', message);

    // 解析消息
    const parsedMessage = JSON.parse(message);
    const messageType = parsedMessage.type;
    const payload = parsedMessage.payload;

    // 根据消息类型处理不同类别的数据
    switch (messageType) {
      case 'initDataList':
        // index.vue中请求初始化DataList，将data.txt中读取的数据传输过去
        // 广播消息给所有连接的客户端（包括 index.vue），通知数据已经更新
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            // client.send(JSON.stringify(dataList));
            const initMessage = {
              type: 'initDataList',
              payload: dataList
            }
            client.send(JSON.stringify(initMessage))
          }
        });
        break;
      case 'updateDataList':
        // console.log("server.js: updateDataList: ", payload)
        // console.log("dataList: updateDataList: ", dataList)

        // 在这里处理来自 robot.vue 的更新 dataList 的消息，并更新 data.txt 文件
        let nodeList = payload
        let location_id
        let style_id
        let user_id
        let showNewNodeList = []
        let showNewEdgeList = []
        for (let index = 0; index < nodeList.length; index++) {
          const obj = nodeList[index];
          // 还要对这些节点的连边做处理
          // 1. 关于这些节点是否已经在KG中存在，若存在，则无需再新增；反之，新增
          // 2. 关于一个episodeData的节点之间要互相连接，连接按照一定规则

          // 1. 判断节点是否存在。遍历dataList中的每个node，先判断label是否相同，然后再判断type是否相同
          for (let index = 0; index < dataList.nodes.length; index++) {
            const element = dataList.nodes[index];
            if (obj.label == element.label && obj.type == element.type) {
              // 那就是已有节点
              console.log('已有节点：', obj)
              obj.id = element.id
              console.log('已有节点：', obj.id)
              break
            }
          }
          if (!obj.id) {
            // 新增节点, 新建id
            obj.id = String('node' + (dataList.nodes.length))
            obj.x = 20*dataList.nodes.length
            obj.y = 20*dataList.nodes.length
            showNewNodeList.push(obj)
            dataList.nodes.push(obj);
          }

          if (obj.type == 'LOCATIONS') {
            location_id = obj.id
          }
          if (obj.type == 'STYLE') {
            style_id = obj.id
          }
          if (obj.type == 'USER_PROPERTY') {
            user_id = obj.id
          }
          // 2. 关于一个episodeData的节点之间要互相连接，连接按照一定规则
          // 在edge中最重要的就是source id和target id
        }

        if (location_id) {
          console.log('loacation_id: ', location_id)
          let edge_flag
          for (let index = 0; index < nodeList.length; index++) {
            edge_flag = false
            const obj = nodeList[index];
            // 判断是否新增边
            // 1. 判断与location_id之间的边是否存在，若不存在，则新增
            for (let index = 0; index < dataList.edges.length; index++) {
              const element = dataList.edges[index];
              if (obj.type == 'STYLE') {
                // 那么style是与user_property连接的
                if (element.source == user_id && element.target == style_id) {
                  console.log('那么style是与user_property连接的')
                  edge_flag = true
                  break
                }
              } else{
                if (element.source == location_id && element.target == obj.id) {
                  // 说明边已存在
                  console.log('那么location与？连接的')
                  edge_flag = true
                  break
                }
              }
            }
            if (!edge_flag) {
              let new_edge
              if (obj.type == 'STYLE' && user_id && user_id != obj.id) {
                // 新增边
                new_edge = {
                  "source": user_id,
                  "target": obj.id,
                  "label": "❓",
                  "type": "line",
                  "style": {
                      "stroke": "#C0C4CC",
                      "lineWidth": 1,
                      "startArrow": false,
                      "endArrow": true
                  },
                  "labelCfg": {
                      "position": "middle",
                      "refX": 0,
                      "refY": 0,
                      "style": {
                          "fill": "#4682B4",
                          "fontWeight": 400,
                          "opacity": 1,
                          "fontFamily": "微软雅黑",
                          "fontSize": 24
                      }
                  }
                }
              } else {
                // 新增边
                console.log('新增location相关的edge。', location_id, obj.id)
                new_edge = {
                  "source": location_id,
                  "target": obj.id,
                  "label": "✅",
                  "type": "line",
                  "style": {
                      "stroke": "#C0C4CC",
                      "lineWidth": 1,
                      "startArrow": false,
                      "endArrow": true
                  },
                  "labelCfg": {
                      "position": "middle",
                      "refX": 0,
                      "refY": 0,
                      "style": {
                          "fill": "#4682B4",
                          "fontWeight": 400,
                          "opacity": 1,
                          "fontFamily": "微软雅黑",
                          "fontSize": 24
                      }
                  }
                }
              }
              showNewEdgeList.push(new_edge)
              dataList.edges.push(new_edge);
            }
          }
        }
        fs.writeFileSync('./data/data.txt', JSON.stringify(dataList));

        // 广播消息给所有连接的客户端（包括 index.vue），通知数据已经更新
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const updateMessage = {
              type: 'updateDataList',
              // payload: nodeList
              payload: {
                'nodeList': showNewNodeList,
                'edgeList': showNewEdgeList
              }
            }
            client.send(JSON.stringify(updateMessage))
          }
        })
        break

      case 'searchRelatedNodes':
        // search算法
        // 1. 首先根据task objective去定位，可以直接捕捉到最相关的一些location，那就是作为备选结果
        let episodeData = payload
        const task = episodeData.TASK_OBJECTIVE
        let task_releated_locations_list = []
        let task_user_time_related_locations_list = {}
        let task_user_time_style_related_locations_list = {}
        for (let index = 0; index < dataList.nodes.length; index++) {
          const node_element = dataList.nodes[index]
          if (node_element.type == 'TASK_OBJECTIVE' && node_element.label == task) {
            // 找到相同的task——objective，再找个与这个task直接关联的location

            for (let index = 0; index < dataList.edges.length; index++) {
              const edge_element = dataList.edges[index];
              if (edge_element.target == node_element.id) { // task_objective作为target的edge
                const source_locations_id = edge_element.source
                for (let index = 0; index < dataList.nodes.length; index++) {
                  const source_node_element = dataList.nodes[index];
                  if (source_node_element.id == source_locations_id && source_node_element.type == 'LOCATIONS') { // 在task_objective作为target的edge的基础上，以location作为source
                    // 与这个task直接关联的locations
                    console.log('related_locations: ', source_node_element.label, source_node_element.type)
                    task_releated_locations_list.push(source_node_element)

                    // （可能有多个locations），找到一个location之后，验证这个location的条件：
                    // 1. 直接关联的user和time与episodeData中的是否一致；
                    // 2. 更严格的，如果user和time一致，那与user直接关联的style是否与episodeData中的一致。

                    let task_location_user_list = []
                    let task_location_time_list = []
                    let task_location_user_style_list = {}

                    for (let index = 0; index < dataList.edges.length; index++) {
                      const user_edge_element = dataList.edges[index];
                      if (user_edge_element.source == source_locations_id) { // location作为source的edge
                        // 寻找与location相关的user和time，判断是否与episodeData中的相同
                        for (let index = 0; index < dataList.nodes.length; index++) {
                          const user_node_element = dataList.nodes[index]
                          // 判断user是不是相同
                          if (user_node_element.id == user_edge_element.target && user_node_element.type == 'USER_PROPERTY' && user_node_element.label == episodeData.USER_PROPERTY) {
                            // user_flag = true
                            console.log('关联并且相同的user：', user_node_element.label)
                            task_location_user_list.push(user_node_element)

                            // 寻找与user关联的style，判断是否与episodeData中的相同
                            for (let index = 0; dataList.edges< array.length; index++) {
                              const style_edge_element = dataList.edges[index];
                              if (style_edge_element.source == user_node_element.id) {
                                for (let index = 0; index < dataList.nodes.length; index++) {
                                  const style_node_element = dataList.nodes[index];
                                  // 判断style是不是相同
                                  if (style_node_element.id == style_edge_element.target && style_node_element.type == 'STYLE' && style_node_element.label == episodeData.STYLE) {
                                      // style_flag = true
                                      console.log('关联并且相同的style：', style_node_element.label)
                                      task_location_user_style_list[user_node_element.label].push(style_node_element)
                                    }
                                }
                              }
                            }
                          } else {
                            // 判断time是不是相同
                            if (user_node_element.id == user_edge_element.target && user_node_element.type == 'TIMESTAMP' && user_node_element.label == episodeData.TIMESTAMP) {
                              // time_flag = true
                              console.log('关联并且相同的time：', user_node_element.label)
                              task_location_time_list.push(user_node_element)
                            }
                          }
                        }
                      }
                    }
                    if (task_location_user_list.length > 0 && task_location_time_list.length > 0) {
                      console.log('user和time、location都相同的task')
                      task_user_time_related_locations_list[source_node_element.id] = {'location': source_node_element, 'user': task_location_user_list, 'time': task_location_time_list}

                      if (task_location_user_style_list.length > 0) {
                        console.log('连style都相同。')
                        task_user_time_style_related_locations_list[source_node_element.id] = {'location': source_node_element, 'user': task_location_user_list, 'time': task_location_time_list, 'style': task_location_user_style_list}
                      }
                    }
                  }
                }
              }
            }
          }
        }
        console.log('task_releated_locations_list: ', task_releated_locations_list)
        console.log('task_user_time_related_locations_list: ', task_user_time_related_locations_list)
        console.log('task_user_time_style_related_locations_list: ', task_user_time_style_related_locations_list)
        break;

      default:
        console.log('Unknown message type:', messageType);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});

// 处理 GET 请求，返回 data.txt 文件的内容
app.get('/api/getData', (req, res) => {
  console.log("server.js: /api/getData")
  res.json(dataList);
});

app.get('/api/getEpisodeVectorList', (req, res) => {
  console.log('server.js: /api/getEpisodeVectorList')
  res.json(episodeVectorList)
})

// 启动服务器
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});