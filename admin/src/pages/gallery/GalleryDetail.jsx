import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Descriptions, Image, Tag, message, Row, Col, Divider, Modal, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import galleryService from '../../services/galleryService';

const GalleryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [galleryItem, setGalleryItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchGalleryItem = async () => {
      try {
        setLoading(true);
        const response = await galleryService.getGalleryItem(id);

        if (signal.aborted) return;

        if (response && response.data && response.data.item) {
          setGalleryItem(response.data.item);
        } else {
          throw new Error('Invalid data structure for gallery item');
        }
      } catch (error) {
        if (signal.aborted) {
          console.log('Fetch aborted for gallery item detail.');
          return;
        }
        console.error('Error fetching gallery item:', error);
        // The service throws an Error object, so we check its message property.
        const errorMessage = error.message || 'Failed to load gallery item';
        message.error(errorMessage);
        navigate('/gallery');
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchGalleryItem();
    }

    return () => {
      controller.abort();
    };
  }, [id, navigate]);

  const handleDelete = async () => {
    Modal.confirm({
      title: 'Are you sure you want to delete this item?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await galleryService.deleteGalleryItem(id);
          message.success('Gallery item deleted successfully');
          navigate('/gallery');
        } catch (error) {
          message.error('Failed to delete gallery item');
        }
      },
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Loading..." /></div>;
  }

  // This check prevents a crash if the fetch fails and the component re-renders before navigation completes.
  if (!galleryItem) {
    return (
      <div className="gallery-detail">
        <div className="page-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/gallery')}
            style={{ marginRight: 16 }}
          >
            Back to Gallery
          </Button>
          <h2>Item Not Found</h2>
        </div>
        <Card><Empty description="The gallery item could not be loaded or does not exist." /></Card>
      </div>
    );
  }

  return (
    <div className="gallery-detail">
      <div className="page-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/gallery')}
          style={{ marginRight: 16 }}
        >
          Back to Gallery
        </Button>
        <h2>Gallery Item Details</h2>
        <div>
          <Link to={`/gallery/edit/${id}`}>
            <Button type="primary" icon={<EditOutlined />} style={{ marginRight: 8 }}>
              Edit
            </Button>
          </Link>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            {galleryItem.mediaType === 'image' ? (
              <Image
                src={galleryItem.mediaUrl}
                alt={galleryItem.title}
                style={{ width: '100%', borderRadius: 8 }}
              />
            ) : (
              <video
                controls
                src={galleryItem.mediaUrl}
                style={{ width: '100%', borderRadius: 8 }}
              />
            )}
          </Col>
          <Col xs={24} md={12}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Title">
                {galleryItem.title || 'Untitled'}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {galleryItem.description || 'No description'}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color={galleryItem.mediaType === 'image' ? 'blue' : 'purple'}>
                  {galleryItem.mediaType?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              {galleryItem.album && (
                <Descriptions.Item label="Album">
                  {galleryItem.album.title}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Status">
                <Tag color={galleryItem.status === 'published' ? 'green' : 'red'}>
                  {galleryItem.status || 'N/A'}
                </Tag>
                {galleryItem.isFeatured && (
                  <Tag color="gold" style={{ marginLeft: 8 }}>
                    Featured
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(galleryItem.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {new Date(galleryItem.updatedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className="media-meta">
              <h3>Media Information</h3>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="File URL">
                  <a href={galleryItem.mediaUrl} target="_blank" rel="noopener noreferrer">
                    {galleryItem.mediaUrl}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="File Type">
                  {galleryItem.metadata?.format || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="File Size">
                  {galleryItem.metadata?.size
                    ? `${(galleryItem.metadata.size / 1024).toFixed(2)} KB`
                    : 'N/A'}
                </Descriptions.Item>
                {galleryItem.metadata?.width && (
                  <Descriptions.Item label="Dimensions">
                    {galleryItem.metadata.width} x {galleryItem.metadata.height}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default GalleryDetail;
