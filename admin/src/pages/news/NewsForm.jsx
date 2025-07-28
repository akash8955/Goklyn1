import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Form, Input, Button, Select, DatePicker, Switch, Upload, message, 
  Card, Row, Col, Typography, Spin, Divider, Tag, Space
} from 'antd';
import { 
  UploadOutlined, 
  PlusOutlined, 
  SaveOutlined, 
  CloseOutlined, 
  EditOutlined 
} from '@ant-design/icons';
import moment from 'moment';
import newsService from '../../services/newsService';
import styles from './news.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { TextArea } = Input;
const { Option } = Select;

const NewsForm = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  // Handle image upload
  const handleImageUpload = async (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await newsService.uploadImage(formData);
      const imageUrl = response.url;
      
      setImageUrl(imageUrl);
      message.success('Image uploaded successfully');
      return false; // Prevent default upload
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Failed to upload image');
      return Upload.LIST_IGNORE;
    } finally {
      setUploading(false);
    }
  };



  // Fetch news data and categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await newsService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Failed to load categories');
    }
  }, []);

  const fetchNewsItem = useCallback(async () => {
    if (!isEdit || !id) return;
    
    try {
      setLoading(true);
      const response = await newsService.getNewsItem(id);
      const newsItem = response.data;
      form.setFieldsValue({
        ...newsItem,
        category: newsItem.category?._id,
        publishedAt: newsItem.publishedAt ? moment(newsItem.publishedAt) : null,
      });
      setContent(newsItem.content || '');
      if (newsItem.featuredImage) {
        setFileList([{
          uid: '-1',
          name: 'featured-image',
          status: 'done',
          url: newsItem.featuredImage,
        }]);
      }
    } catch (error) {
      console.error('Error fetching news item:', error);
      message.error('Failed to load news item');
      navigate('/news');
    } finally {
      setLoading(false);
    }
  }, [id, isEdit, form, navigate]);

  useEffect(() => {
    fetchCategories();
    if (isEdit && id) {
      fetchNewsItem();
    }
  }, [fetchCategories, fetchNewsItem, isEdit, id]);


  
  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      const data = {
        ...values,
        featuredImage: imageUrl,
        content,
        tags,
        publishedAt: values.publishedAt ? values.publishedAt.toISOString() : new Date().toISOString(),
      };

      if (isEdit) {
        await newsService.updateNews(id, data);
        message.success('News article updated successfully');
      } else {
        await newsService.createNews(data);
        message.success('News article created successfully');
      }
      
      navigate('/news');
    } catch (error) {
      message.error(`Failed to ${isEdit ? 'update' : 'create'} news`);
      console.error('Error saving news:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle tag input
  const handleTagClose = (removedTag) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    setTags(newTags);
  };
  
  const showInput = () => setInputVisible(true);
  
  const handleInputChange = (e) => setInputValue(e.target.value);
  
  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  return (
    <div className={styles.newsFormContainer}>
      <Card
        title={
          <div className={styles.header}>
            <h2>{isEdit ? 'Edit News Article' : 'Create New Article'}</h2>
            <div className={styles.actions}>
              <Link to="/news">
                <Button icon={<CloseOutlined />}>Cancel</Button>
              </Link>
              <Button
                type="primary"
                icon={saving ? null : <SaveOutlined />}
                onClick={() => form.submit()}
                loading={saving}
                disabled={loading}
              >
                {saving ? 'Saving...' : 'Save Article'}
              </Button>
            </div>
          </div>
        }
        className={styles.formCard}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: 'draft',
              isFeatured: false,
            }}
            className={styles.newsForm}
          >
            <Row gutter={24}>
              <Col xs={24} lg={16}>
                <Card className={styles.contentCard}>
                  <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true, message: 'Please enter a title' }]}
                  >
                    <Input 
                      placeholder="Enter news title" 
                      size="large"
                      prefix={<EditOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    name="content"
                    label="Content"
                    rules={[{ required: true, message: 'Please enter content' }]}
                  >
                    <ReactQuill
                      theme="snow"
                      className={styles.quillEditor}
                      placeholder="Write your news content here..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="excerpt"
                    label="Excerpt"
                    rules={[{ required: true, message: 'Please provide a short excerpt' }]}
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="A short summary of the news article"
                      maxLength={300}
                      showCount
                    />
                  </Form.Item>
                </Card>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card className={styles.sidebarCard}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Option value="draft">Draft</Option>
                      <Option value="published">Published</Option>
                      <Option value="archived">Archived</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="publishedAt"
                    label="Publish Date & Time"
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select
                      placeholder="Select a category"
                      loading={!categories.length}
                      showSearch
                    >
                      {categories.map(category => (
                        <Option key={category._id} value={category._id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="featuredImage"
                    label="Featured Image"
                    extra="Recommended size: 1200x630px"
                  >
                    <Upload
                      name="featuredImage"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
                      beforeUpload={handleImageUpload}
                      disabled={uploading}
                    >
                      {imageUrl ? (
                        <img src={imageUrl} alt="featured" style={{ width: '100%' }} />
                      ) : (
                        <div>
                          {uploading ? <Spin /> : <PlusOutlined />}
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>

                  <Form.Item
                    name="isFeatured"
                    label="Featured Article"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Divider>Tags</Divider>
                  <div className={styles.tagsContainer}>
                    {tags.map(tag => (
                      <Tag 
                        key={tag} 
                        closable 
                        onClose={() => handleTagClose(tag)}
                        className={styles.tag}
                      >
                        {tag}
                      </Tag>
                    ))}
                    
                    {inputVisible ? (
                      <Input
                        type="text"
                        size="small"
                        className={styles.tagInput}
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputConfirm}
                        onPressEnter={handleInputConfirm}
                        autoFocus
                      />
                    ) : (
                      <Tag 
                        className={styles.addTag} 
                        onClick={showInput}
                      >
                        <PlusOutlined /> New Tag
                      </Tag>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default NewsForm;
