import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import webSee from '../../packages/core/src';
import performance from '../../packages/performance/src';
import recordscreen from '../../packages/recordscreen/src';

webSee.init({
  dsn: 'http://localhost:8081/reportData',
  apikey: 'project1',
  silentWhiteScreen: true,
  skeletonProject: true,
  repeatCodeError: true,
  userId: '12345',
});

webSee.use(performance);
webSee.use(recordscreen);

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 将错误上报给服务器
    webSee.errorBoundary(error);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// 上报 Web Vitals 性能数据
reportWebVitals(console.log); // 或者发送到服务器

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
