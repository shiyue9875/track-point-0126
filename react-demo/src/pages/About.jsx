import React from 'react';
import { Button } from 'antd';

const About = () => {
  const jsErr = () => {
    const num = new Number(12.34);
    console.log(num.toFixed(-1)); // 这里会报错
  };

  return (
    <div className="about">
      <h1>This is an about page</h1>
      <Button type="primary" onClick={jsErr}>
        JS 错误
      </Button>
    </div>
  );
};

export default About;
