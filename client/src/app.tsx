import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import HomePage from './pages/HomePage/HomePage';
import PaintPage from './pages/PaintPage/PaintPage';
import GalleryPage from './pages/GalleryPage/GalleryPage';
import MinePage from './pages/MinePage/MinePage';
import FeedbackPage from './pages/FeedbackPage/FeedbackPage';
import AdminPage from './pages/AdminPage/AdminPage';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="paint" element={<PaintPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="mine" element={<MinePage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
