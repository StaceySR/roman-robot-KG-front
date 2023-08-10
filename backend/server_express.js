// express服务器
const fs = require('fs');
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

  console.log('Read data from data.txt:', dataList);
} catch (error) {
  console.error('Error reading data from data.txt:', error);
}

// 处理 GET 请求，返回 data.txt 文件的内容
app.get('/api/getData', (req, res) => {
  console.log("server.js: /api/getData")
  res.json(dataList);
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
