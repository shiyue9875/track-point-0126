import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home'; // 假设有 Home 组件
import About from './pages/About'; // 假设有 About 组件
import logo from './logo.svg';
import './App.css'; // 样式文件

const App = () => {
  return (
    <Router>
      <div id="app">
        {/* 头部区域 */}
        <div className="header">
          <img className="logo" src={logo} alt="logo" />
          <span className="title">前端监控 test</span>
        </div>

        {/* 导航栏 */}
        <nav>
          <Link to="/">Home</Link> | <Link to="/about">About</Link>
        </nav>

        {/* 路由视图 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
