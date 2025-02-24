const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const coBody = require('co-body');

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true, parameterLimit: 50000 }));

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

// 存储性能数据
let performanceList = [];
// 存储错误数据
let errorList = [];
// 存储录屏数据
let recordScreenList = [];
// 存储白屏检测数据
let whiteScreenList = [];

// 获取js.map源码文件
app.get('/getmap', (req, res) => {
  let fileName = req.query.fileName;
  if (req.query.env == 'development') {
    let mapFile = path.join(__filename, '..', fileName);
    console.log('mapFile', mapFile);
    fs.readFile(mapFile, function (err, data) {
      if (err) {
        console.error(err);
        return;
      }
      res.send(data);
    });
  } else {
    // req.query 获取接口参数
    let mapFile = path.join(__filename, '..', 'dist/js');
    // 拿到dist目录下对应map文件的路径
    let mapPath = path.join(mapFile, `${fileName}.map`);
    fs.readFile(mapPath, function (err, data) {
      if (err) {
        console.error(err);
        return;
      }
      res.send(data);
    });
  }
});

app.get('/getErrorList', (req, res) => {
  res.send({
    code: 200,
    data: errorList,
  });
});

app.get('/getRecordScreenId', (req, res) => {
  let id = req.query.id;
  let data = recordScreenList.filter(item => item.recordScreenId == id);
  res.send({
    code: 200,
    data,
  });
});

app.post('/reportData', async (req, res) => {
  try {
    let length = Object.keys(req.body).length;
    if (length) {
      recordScreenList.push(req.body);
    } else {
      try {
        let data = await coBody.json(req);
        if (!data) {
          return res.status(400).json({ error: '数据为空' });
        }
        if (data.type == 'performance') {
          performanceList.push(data);
        } else if (data.type == 'recordScreen') {
          recordScreenList.push(data);
        } else if (data.type == 'whiteScreen') {
          whiteScreenList.push(data);
        } else {
          errorList.push(data);
        }
      } catch (parseError) {
        return res.status(400).json({ error: '解析数据失败' });
      }
    }
    res.send({
      code: 200,
      message: '上报成功！',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(8084, () => {
  console.log('Server is running at http://localhost:8084');
});
