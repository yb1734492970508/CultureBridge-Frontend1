import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import routes from './routes/routes';
import RouteGuard from './routes/RouteGuard';
import { AppProvider } from './context/AppContext';
import './styles/App.css';
import './styles/responsive.css';

// 路由切换动画组件
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <div className="page-transition">
      <Routes location={location}>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.requireAuth ? (
                <RouteGuard requireAuth={true} redirectTo="/">
                  {route.element}
                </RouteGuard>
              ) : (
                route.element
              )
            }
          />
        ))}
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
