import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Timeline, message } from 'antd';
import { findCodeBySourceMap } from '../utils/sourcemap';
import { unzip } from '../utils/recordScreen.js';
import rrwebPlayer from 'rrweb-player';
import Handle from 'rc-slider/lib/Handles/Handle.js';

const HomeView = () => {
  const [fullscreen, setFullscreen] = useState(true);
  const [revertdialog, setRevertdialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [activities, setActivities] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    getTableData();
  }, []);

  const getTableData = () => {
    setTimeout(() => {
      fetch('http://localhost:8084/getErrorList')
        .then(response => response.json())
        .then(res => {
          setTableData(res.data);
          console.log(res.data);
        });
    }, 500);
  };

  const format = time => {
    const str = new Date(time);
    return str.toLocaleDateString().replace(/\//g, '-') + ' ' + str.toTimeString().substr(0, 8);
  };

  const revertBehavior = breadcrumb => {
    setDialogTitle('查看用户行为');
    setFullscreen(false);
    setRevertdialog(true);
    breadcrumb.forEach(item => {
      item.color = item.status === 'ok' ? '#5FF713' : '#F70B0B';
      item.icon = item.status === 'ok' ? 'check' : 'close';
      if (item.category === 'Click') {
        item.content = `用户点击dom: ${item.data}`;
      } else if (item.category === 'Http') {
        item.content = `调用接口: ${item.data.url}, ${
          item.status === 'ok' ? '请求成功' : '请求失败'
        }`;
      } else if (item.category === 'Code_Error') {
        item.content = `代码报错：${item.data.message}`;
      } else if (item.category === 'Resource_Error') {
        item.content = `加载资源报错：${item.message}`;
      } else if (item.category === 'Route') {
        item.content = `路由变化：从 ${item.data.from} 页面切换到 ${item.data.to} 页面`;
      }
    });
    setActivities(breadcrumb);
  };

  const revertCode = row => {
    console.log(row);
    findCodeBySourceMap(row, res => {
      setDialogTitle('查看源码');
      setFullscreen(false);
      setRevertdialog(true);
      setContent(res);
      // setTimeout(() => {
      //   const revertElement = document.getElementById('revert');
      //   console.log(revertElement);
      //   if (revertElement) {
      //     revertElement.innerHTML = res;
      //   } else {
      //     console.error('未找到 ID 为 "revert" 的元素。');
      //   }
      // });
    });
  };

  const playRecord = id => {
    fetch(`http://localhost:8084/getRecordScreenId?id=${id}`)
      .then(response => response.json())
      .then(res => {
        let { code, data } = res;
        if (code === 200 && Array.isArray(data) && data[0] && data[0].events) {
          let events = unzip(data[0].events);
          setFullscreen(true);
          setDialogTitle('播放录屏');
          setRevertdialog(true);
          setTimeout(() => {
            new rrwebPlayer({
              target: document.getElementById('revert'),
              data: {
                events,
              },
            });
          });
        } else {
          message.warning('暂无数据，请稍后重试~');
        }
      });
  };

  const xhrError = () => {
    const ajax = new XMLHttpRequest();
    ajax.open('GET', 'https://abc.com/test/api');
    ajax.setRequestHeader('content-type', 'application/json');
    ajax.onreadystatechange = () => {
      if (ajax.readyState === 4) {
        getTableData();
      }
      if (ajax.status === 200 || ajax.status === 304) {
        console.log('ajax', ajax);
      }
    };
    ajax.send();
  };

  const asyncError = () => {
    getTableData();
    setTimeout(() => {
      JSON.parse('');
    });
  };

  const codeErr = () => {
    getTableData();
    let a = undefined;
    if (a.length) {
      console.log('1');
    }
  };

  const resourceError = () => {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://abc.com/index.js';
    document.body.appendChild(script);
    script.onerror = () => {
      getTableData();
    };
  };

  const promiseErr = () => {
    new Promise(resolve => {
      getTableData();
      let person = {};
      person.name.age();
      resolve();
    });
  };

  const fetchError = () => {
    fetch('https://jsonplaceholder.typicode.com/posts/a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({ id: 1 }),
    })
      .then(res => {
        if (res.status === 404) {
          getTableData();
        }
      })
      .catch(() => {
        getTableData();
      });
  };

  return (
    <div className="home">
      <div className="el-row">
        <Button type="primary" onClick={codeErr}>
          js错误
        </Button>
        <Button type="success" onClick={asyncError}>
          异步错误
        </Button>
        <Button type="danger" onClick={promiseErr}>
          promise错误
        </Button>
      </div>
      <div className="el-row">
        <Button type="info" onClick={xhrError}>
          xhr请求报错
        </Button>
        <Button type="warning" onClick={fetchError}>
          fetch请求报错
        </Button>
      </div>
      <div className="el-row">
        <Button type="danger" onClick={resourceError}>
          加载资源报错
        </Button>
      </div>
      <p className="error">报错统计</p>
      <Table dataSource={tableData} style={{ width: '100%' }} rowKey={record => record.id}>
        <Table.Column title="序号" dataIndex="index" width={50} />
        <Table.Column title="报错信息" dataIndex="message" width={300} />
        <Table.Column title="报错页面" dataIndex="pageUrl" />
        <Table.Column title="报错时间" dataIndex="time" width={150} render={time => format(time)} />
        <Table.Column title="项目编号" dataIndex="apikey" />
        <Table.Column title="用户id" dataIndex="userId" />
        <Table.Column title="SDK版本" dataIndex="sdkVersion" />
        <Table.Column title="浏览器信息" dataIndex={['deviceInfo', 'browser']} />
        <Table.Column title="操作系统" dataIndex={['deviceInfo', 'os']} />
        <Table.Column
          title="还原错误代码"
          width={100}
          render={(text, row) =>
            (row.type === 'error' || row.type === 'unhandledrejection') && (
              <Button onClick={() => revertCode(row)}>查看源码</Button>
            )
          }
        />
        <Table.Column
          title="播放录屏"
          width={100}
          render={(text, row) =>
            row.recordScreenId && (
              <Button onClick={() => playRecord(row.recordScreenId)}>播放录屏</Button>
            )
          }
        />
        <Table.Column
          title="用户行为记录"
          width={125}
          render={(text, row) =>
            row.breadcrumb && <Button onClick={() => revertBehavior(row)}>查看用户行为</Button>
          }
        />
      </Table>

      <Modal
        title={dialogTitle}
        open={revertdialog}
        onCancel={() => setRevertdialog(false)}
        footer={null}
        width="90%"
        destroyOnClose
      >
        <div id="revert" dangerouslySetInnerHTML={{ __html: content }}></div>
        {dialogTitle === '查看用户行为' && (
          <Timeline>
            {activities.map((activity, index) => (
              <Timeline.Item
                key={index}
                dot={<span style={{ color: activity.color }} />}
                color={activity.color}
              >
                <span>{format(activity.time)}</span>
                <p>{activity.content}</p>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Modal>
    </div>
  );
};

export default HomeView;
