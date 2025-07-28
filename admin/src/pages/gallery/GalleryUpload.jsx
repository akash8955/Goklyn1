import React from 'react';
import GalleryForm from './GalleryForm';
import { Card } from 'antd';

const GalleryUpload = () => {
  return (
    <Card title="Upload New Gallery Item" style={{ maxWidth: 600, margin: '32px auto' }}>
      <div style={{ color: 'green', marginBottom: 8 }}>GalleryUpload page loaded</div>
      <GalleryForm isEdit={false} />
    </Card>
  );
};

export default GalleryUpload;
