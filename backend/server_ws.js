// websocket服务器
const fs = require('fs');
const WebSocket = require('ws');

// 读取 data.txt 文件中的数据作为初始 dataList
let dataList = [];

// 读取 data.txt 文件内容，存入dataList
try {
  const data = fs.readFileSync('./data/data.txt', 'utf8');

  // 将读取的内容解析为 JSON 格式，并赋值给 dataList 变量
  dataList = JSON.parse(data);

//   console.log('Read data from data.txt:', dataList);
} catch (error) {
  console.error('Error reading data from data.txt:', error);
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
        console.log("server.js: updateDataList: ", payload)
        // console.log("dataList: updateDataList: ", dataList)
        // 在这里处理来自 robot.vue 的更新 dataList 的消息，并更新 data.txt 文件
        dataList.nodes.push(payload);
        fs.writeFileSync('./data/data.txt', JSON.stringify(dataList));

        // 广播消息给所有连接的客户端（包括 index.vue），通知数据已经更新
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            // client.send(JSON.stringify(dataList));
            client.send(message)
          }
        });
        break;
      case 'otherMessageType':
        // 在这里处理其他类型的消息
        // ...
        break;
      // 可以根据需要添加更多的消息类型
      // ...
      default:
        console.log('Unknown message type:', messageType);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});
