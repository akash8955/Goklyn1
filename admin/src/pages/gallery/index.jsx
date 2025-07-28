import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GalleryList from './GalleryList';
import GalleryForm from './GalleryForm';
import GalleryDetail from './GalleryDetail';
import GalleryUpload from './GalleryUpload';

const Gallery = () => {
  return (
    <Routes>
      <Route index element={<GalleryList />} />
      <Route path="upload" element={<GalleryUpload />} />
      <Route path=":id" element={<GalleryDetail />} />
      <Route path="edit/:id" element={<GalleryForm isEdit />} />
      <Route path="*" element={<Navigate to="/gallery" replace />} />
    </Routes>
  );
};

export default Gallery;
