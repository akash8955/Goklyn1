import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Upload, message, Select, Switch, Modal } from 'antd';
import { UploadOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import galleryService from '../../services/galleryService';
import albumService from '../../services/albumService';
import { useAuth } from '../../contexts/AuthContext';

const { TextArea } = Input;
const { Option } = Select;

const GalleryForm = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [isAlbumModalVisible, setIsAlbumModalVisible] = useState(false);
  const [albumForm] = Form.useForm();
  const [isAlbumCreating, setIsAlbumCreating] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      // Only fetch data if the user is authenticated and auth state is not loading
      if (isAuthenticated && !authLoading) {
        try {
          // Fetch the list of albums required for the dropdown
          if (isMounted) {
            await fetchAlbums(true); // Force fetch
          }
          
          // If we are in "edit" mode and have an ID, fetch the specific item's data
          if (isEdit && id && isMounted) {
            await fetchGalleryItem(id);
          }
        } catch (error) {
          console.error('Error initializing form data:', error);
        }
      }
    };
    
    initializeData();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, authLoading, isEdit, id]);

  // Add a ref to track the last fetch time
  const lastFetchTime = React.useRef(0);
  const isFetching = React.useRef(false);

  const fetchAlbums = async (force = false) => {
    const now = Date.now();
    
    // Prevent multiple simultaneous requests and rapid successive requests (throttle to 5 seconds)
    if (isFetching.current || (!force && now - lastFetchTime.current < 5000)) {
      return albums;
    }

    isFetching.current = true;
    lastFetchTime.current = now;
    
    try {
      console.log('Fetching albums...');
      const response = await albumService.getAlbums();
      const albumsData = response.data || [];
      setAlbums(albumsData);
      return albumsData;
    } catch (error) {
      console.error('Error fetching albums:', error);
      if (error && typeof error === 'string' && error.includes('requests too quickly')) {
        message.error(error, 5);
      } else {
        message.error('Failed to load albums');
      }
      return [];
    } finally {
      isFetching.current = false;
    }
  };

  const handleCreateAlbum = async (values) => {
    console.log('Creating album with values:', values);
    if (!values.title || !values.title.trim()) {
      message.error('Please enter an album title');
      return;
    }

    try {
      setIsAlbumCreating(true);
      
      // Prepare album data
      const albumData = {
        title: values.title.trim(),
        description: (values.description || '').trim(),
        isActive: true,
        status: 'published'
      };

      console.log('Sending album creation request with data:', albumData);
      
      // Create the album
      const response = await albumService.createAlbum(albumData);
      console.log('Album creation response:', response);
      
      if (!response || !response.data) {
        throw new Error('No data received from server');
      }

      message.success('Album created successfully');
      
      // Force refresh the albums list
      const updatedAlbums = await fetchAlbums(true);
      console.log('Updated albums:', updatedAlbums);
      
      // Set the new album as selected
      if (response.data._id) {
        form.setFieldsValue({ album: response.data._id });
      } else if (updatedAlbums && updatedAlbums.length > 0) {
        form.setFieldsValue({ album: updatedAlbums[0]._id });
      }
      
      setIsAlbumModalVisible(false);
      albumForm.resetFields();
    } catch (error) {
      console.error('Error in handleCreateAlbum:', {
        error,
        response: error.response,
        message: error.message,
        stack: error.stack
      });
      
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to create album. Please try again.';
      
      message.error(errorMessage, 5);
      
      // If there's a validation error from the server, show the error in the form
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        albumForm.setFields(
          Object.keys(errors).map(field => ({
            name: field,
            errors: [errors[field].message]
          }))
        );
      }
    } finally {
      setIsAlbumCreating(false);
    }
  };

  const fetchGalleryItem = async (itemId) => {
    try {
      const response = await galleryService.getGalleryItem(itemId); // API returns { status, data: { item } }
      const itemData = response.data.item;
      form.setFieldsValue({
        ...itemData,
        album: itemData.album?._id, // The populated album object has `_id` which matches the `id` from getAlbums
      });
      if (itemData.mediaUrl) {
        setFileList([
          {
            uid: '-1',
            name: itemData.title || 'Media file',
            status: 'done',
            url: itemData.mediaUrl,
            thumbUrl: itemData.thumbnailUrl || itemData.mediaUrl,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching gallery item:', error);
      if (error && typeof error === 'string' && error.includes('requests too quickly')) {
      message.error(error, 5);
      return;
    }
    message.error('Failed to load gallery item');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('[GalleryForm] Form values:', values);
      
      const formData = new FormData();
      
      // Append fields to formData
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // Append files if any
      if (fileList.length > 0 && fileList[0].originFileObj) {
        console.log('[GalleryForm] Appending file to form data:', fileList[0]);
        formData.append('file', fileList[0].originFileObj);
      } else if (!isEdit) {
        // Only require file for new items, not for updates
        message.error('Please select a file to upload');
        setLoading(false);
        return;
      }

      // Log form data for debugging
      console.log('[GalleryForm] FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      if (isEdit && id) {
        console.log(`[GalleryForm] Updating gallery item ${id}`);
        await galleryService.updateGalleryItem(id, formData);
        message.success('Gallery item updated successfully');
      } else {
        console.log('[GalleryForm] Creating new gallery item');
        await galleryService.createGalleryItem(formData);
        message.success('Gallery item created successfully');
      }
      
      navigate('/gallery');
    } catch (error) {
      console.error('Error saving gallery item:', error);
      if (error && typeof error === 'string' && error.includes('requests too quickly')) {
      message.error(error, 5);
      return;
    }
    message.error(`Failed to ${isEdit ? 'update' : 'create'} gallery item`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      message.error('You can only upload image or video files!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File must be smaller than 10MB!');
      return Upload.LIST_IGNORE;
    }
    
    return false; // Prevent auto upload
  };

  return (
    <div className="gallery-form">
      <div className="page-header">
        <h2>{isEdit ? 'Edit' : 'Add New'} Gallery Item</h2>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isFeatured: false,
            isActive: true,
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="album"
            label="Album"
            rules={[{ required: true, message: 'Please select an album' }]}
          >
            <Select 
              placeholder="Select album"
              dropdownRender={menu => (
                <div>
                  {menu}
                  <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                    <Button 
                      type="text" 
                      icon={<PlusOutlined />} 
                      onClick={() => setIsAlbumModalVisible(true)}
                      style={{ width: '100%', textAlign: 'left' }}
                    >
                      Create New Album
                    </Button>
                  </div>
                </div>
              )}
            >
              {albums.map((album) => (
                <Option key={album._id} value={album._id}>
                  {album.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          {albums.length === 0 && (
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <p style={{ color: '#ff4d4f', marginBottom: 8 }}>No albums found. Please create an album to continue.</p>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setIsAlbumModalVisible(true)}
              >
                Create New Album
              </Button>
            </div>
          )}

          <Form.Item
            label={isEdit ? 'Replace Media' : 'Upload Media'}
            extra="Supports images and videos (max 10MB)"
            required={!isEdit}
          >
            <Upload.Dragger
              name="file"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleFileChange}
              maxCount={1}
              listType="picture-card"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single file upload.
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            name="isFeatured"
            label="Featured"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select placeholder="Select status">
              <Option value="published">Published</Option>
              <Option value="draft">Draft</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => navigate('/gallery')}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Create Album Modal */}
      <Modal
        title="Create New Album"
        open={isAlbumModalVisible}
        onCancel={() => {
          setIsAlbumModalVisible(false);
          albumForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsAlbumModalVisible(false);
            albumForm.resetFields();
          }}>
            Cancel
          </Button>,
          <Button 
            key="create" 
            type="primary" 
            loading={isAlbumCreating}
            onClick={() => albumForm.submit()}
          >
            Create
          </Button>,
        ]}
      >
        <Form
          form={albumForm}
          layout="vertical"
          onFinish={handleCreateAlbum}
        >
          <Form.Item
            name="title"
            label="Album Title"
            rules={[{ required: true, message: 'Please enter album title' }]}
          >
            <Input placeholder="Enter album title" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter album description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GalleryForm;
