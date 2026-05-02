import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import LoginPanel from './components/LoginPanel/LoginPanel';
import RecoverPassword from './components/RecoverPassword/RecoverPassword';
import './index.css';

function App() {
  return (
    <Router>
    <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#7e9ab2' }}>
      <Routes>
          <Route path="/" element={<LoginPanel />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;
