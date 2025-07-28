import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GalleryList from '../pages/gallery/GalleryList';
import GalleryForm from '../pages/gallery/GalleryForm';
import GalleryDetail from '../pages/gallery/GalleryDetail';

const GalleryRoutes = () => (
  <Routes>
    <Route index element={<GalleryList />} />
    <Route path="upload" element={<GalleryForm />} />
    <Route path=":id" element={<GalleryDetail />} />
    <Route path="edit/:id" element={<GalleryForm isEdit />} />
    <Route path="*" element={<Navigate to="/gallery" replace />} />
  </Routes>
);

export default GalleryRoutes;
