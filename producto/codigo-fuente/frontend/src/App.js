import logo from './logo.svg';
import Header from './components/Header/Header';
import LoginPanel from './components/LoginPanel/LoginPanel';
import './index.css';

function App() {
  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#7e9ab2' }}>
      <Header />
      <LoginPanel />
    </div>
  );
}

export default App;
