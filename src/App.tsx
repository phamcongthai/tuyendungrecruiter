import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import AppRouter from './router';

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
