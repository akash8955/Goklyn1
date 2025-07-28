import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  Upload, 
  message, 
  Card, 
  Typography, 
  Space, 
  Col, 
  Row,
  Spin
} from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined, 
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import newsService from '../../services/newsService';
import { mockCategories } from '../../utils/mockNewsData';

// Fallback editor component if TinyMCE is not available
const SimpleEditor = ({ value, onChange }) => (
  <Input.TextArea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={10}
    placeholder="Enter article content here..."
  />
);

const { Title, Text } = Typography;
const { Option } = Select;

const NewsForm = ({ isEdit = false, onSuccess, onCancel }) => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState(mockCategories);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Fetch article data if in edit mode
  const { data: article, isLoading: isLoadingArticle } = useQuery(
    ['newsItem', id],
    () => newsService.getNewsItem(id),
    {
      enabled: !!id,
      onSuccess: (data) => {
        if (data) {
          form.setFieldsValue({
            ...data,
            category: data.category?._id || data.category,
          });
          if (data.featuredImage) {
            setImageUrl(data.featuredImage);
          }
        }
      },
      onError: (error) => {
        message.error(error.message || 'Failed to load article');
      },
    }
  );
  
  // Mutation for saving article
  const { mutateAsync: saveArticle, isLoading: isSubmitting } = useMutation(
    isEdit 
      ? (data) => newsService.updateNews(id, data)
      : (data) => newsService.createNews(data)
  );
  
  const loading = isLoadingArticle || isSubmitting;

  // Handle form submission
  const onFinish = async (values) => {
    try {
      const articleData = {
        ...values,
        status: values.status || 'draft',
        featuredImage: imageUrl,
      };
      
      const result = await saveArticle(articleData);
      message.success(
        isEdit ? 'Article updated successfully' : 'Article created successfully'
      );
      
      // Invalidate news queries to refresh the list
      await queryClient.invalidateQueries('news');
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate(`/news/${result._id || result.id}`);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      message.error(error.message || 'Failed to save article');
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await newsService.getCategories();
        setCategories(data || mockCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use default categories from mock data
        setCategories(mockCategories);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (categories.length === mockCategories.length) {
      fetchCategories();
    }
  }, []);

  // Image upload handler
  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await newsService.uploadImage(formData);
      setImageUrl(response.url);
      form.setFieldsValue({ featuredImage: response.url });
      message.success('Image uploaded successfully');
      return response.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error(error.response?.data?.message || 'Failed to upload image');
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Before upload validation
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isImage && isLt2M;
  };

  // Form submission handler is defined above with the saveArticle mutation

  const uploadButton = (
    <div>
      {uploading ? <span>Uploading...</span> : <UploadOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="news-form-container">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={onCancel || (() => navigate(-1))}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>
      
      <Card>
        <Title level={3} style={{ marginBottom: 24 }}>
          {isEdit ? 'Edit Article' : 'Create New Article'}
        </Title>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'draft',
            title: '',
            excerpt: '',
            content: '',
            category: categories[0]?._id,
            tags: [],
            featuredImage: ''
          }}
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please enter a title' }]}
              >
                <Input placeholder="Enter article title" disabled={loading} />
              </Form.Item>

              <Form.Item
                name="excerpt"
                label="Excerpt"
                rules={[{ required: true, message: 'Please enter an excerpt' }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter a brief excerpt"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                name="content"
                label="Content"
                rules={[{ required: true, message: 'Please enter the article content' }]}
              >
                <SimpleEditor
                  value={form.getFieldValue('content')}
                  onChange={(content) => {
                    form.setFieldsValue({ content });
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Select disabled={loading}>
                  <Option value="draft">Draft</Option>
                  <Option value="published">Published</Option>
                  <Option value="archived">Archived</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select
                  showSearch
                  placeholder="Select a category"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  loading={categoriesLoading}
                  disabled={loading}
                >
                  {categories.map(category => (
                    <Option key={category._id} value={category._id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="tags"
                label="Tags"
                extra="Separate tags with commas"
              >
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder="Add tags"
                  tokenSeparators={[',']}
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                name="featuredImage"
                label="Featured Image"
                extra="Upload or enter image URL"
              >
                <Input
                  placeholder="Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={loading || uploading}
                  addonAfter={
                    <Upload
                      name="image"
                      showUploadList={false}
                      beforeUpload={beforeUpload}
                      customRequest={({ file, onSuccess }) => {
                        handleImageUpload(file).then(() => onSuccess('ok'));
                      }}
                      disabled={uploading}
                    >
                      <Button icon={<UploadOutlined />} loading={uploading}>
                        Upload
                      </Button>
                    </Upload>
                  }
                />
              </Form.Item>

              {imageUrl && (
                <div style={{ marginBottom: 16 }}>
                  <img 
                    src={imageUrl} 
                    alt="Featured" 
                    style={{ maxWidth: '100%', maxHeight: 200, marginTop: 8 }} 
                  />
                </div>
              )}

              <Form.Item>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />} 
                    loading={loading}
                    block
                  >
                    {isEdit ? 'Update Article' : 'Publish Article'}
                  </Button>
                  <Button 
                    onClick={onCancel || (() => navigate(-1))}
                    disabled={loading}
                    block
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default NewsForm;
