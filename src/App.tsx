import React from 'react';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import AppRouter from './router';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <div className="App">
        <AppRouter />
      </div>
    </ConfigProvider>
  );
}

export default App;
