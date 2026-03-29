import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 页面组件
import PracticePage from '../pages/PracticePage';
import DiagnoseStartPage from '../pages/DiagnoseStartPage';
import ProfilePage from '../pages/ProfilePage';

// 组件导入（实际渲染由 App.tsx 处理，这里只做路由声明）
const Placeholder: React.FC = () => null;

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 以下路由在 App.tsx 中通过 useLocation 处理渲染逻辑 */}
      <Route path="/" element={<Placeholder />} />
      <Route path="/practice" element={<Placeholder />} />
      <Route path="/diagnose-start" element={<Placeholder />} />
      <Route path="/diagnose-engine" element={<Placeholder />} />
      <Route path="/diagnose-result" element={<Placeholder />} />
      <Route path="/diagnostic-result" element={<Placeholder />} />
      <Route path="/topic/:id" element={<Placeholder />} />
      <Route path="/history" element={<Placeholder />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/expert-profile" element={<Placeholder />} />
      <Route path="/expert/:expertId" element={<Placeholder />} />
      <Route path="/expert/:expertId/case/:caseId" element={<Placeholder />} />
    </Routes>
  );
};

export default AppRoutes;
