import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Button, Tag, Skeleton, Row, Col, Divider, Typography, Avatar, Image, message, Modal, Result 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  EyeOutlined,
  ClockCircleOutlined,
  TagOutlined
} from '@ant-design/icons';
import moment from 'moment';
import newsService from '../../services/newsService';
import styles from './news.module.css';

const { Title, Text, Paragraph } = Typography;

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const { data } = await newsService.getNewsItem(id);
        setArticle(data);
        
        // Fetch related news (in a real app, you would call an API endpoint for related news)
        if (data.tags && data.tags.length > 0) {
          // This is a simplified example - in a real app, you'd have a proper API endpoint
          const relatedRes = await newsService.getNews({
            tags: data.tags[0],
            limit: 3,
            exclude: data._id
          });
          setRelatedNews(relatedRes.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        message.error('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleDelete = async () => {
    Modal.confirm({
      title: 'Delete Article',
      content: 'Are you sure you want to delete this article? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await newsService.deleteNews(id);
          message.success('Article deleted successfully');
          navigate('/news');
        } catch (error) {
          console.error('Error deleting article:', error);
          message.error('Failed to delete article');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className={styles.newsDetailContainer}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className={styles.newsDetailContainer}>
        <Card>
          <Result
            status="404"
            title="404"
            subTitle="Sorry, the article you visited does not exist."
            extra={
              <Button type="primary" onClick={() => navigate('/news')}>
                Back to News
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const {
    title,
    content,
    excerpt,
    featuredImage,
    category,
    author,
    publishedAt,
    readingTime = '5',
    tags = [],
    meta = {}
  } = article;

  return (
    <div className={styles.newsDetailContainer}>
      <div className={styles.articleHeader}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/news')}
          className={styles.backButton}
        >
          Back to News
        </Button>
        
        <div className={styles.articleActions}>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/news/edit/${id}`)}
            className={styles.editButton}
          >
            Edit Article
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            className={styles.deleteButton}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card className={styles.articleCard}>
        <div className={styles.articleMeta}>
          <div className={styles.metaLeft}>
            <Tag color={category?.color || 'blue'} className={styles.categoryTag}>
              {category?.name || 'Uncategorized'}
            </Tag>
            <Text type="secondary" className={styles.metaText}>
              <CalendarOutlined /> {moment(publishedAt).format('MMMM D, YYYY')}
            </Text>
            <Text type="secondary" className={styles.metaText}>
              <ClockCircleOutlined /> {readingTime} min read
            </Text>
            {meta.viewCount !== undefined && (
              <Text type="secondary" className={styles.metaText}>
                <EyeOutlined /> {meta.viewCount} views
              </Text>
            )}
          </div>
          
          <div className={styles.authorInfo}>
            <Avatar 
              icon={<UserOutlined />} 
              src={author?.avatar}
              className={styles.avatar}
            />
            <div>
              <Text strong>{author?.name || 'Admin'}</Text>
              <Text type="secondary" className={styles.authorRole}>
                {author?.role || 'Author'}
              </Text>
            </div>
          </div>
        </div>

        <Title level={2} className={styles.articleTitle}>
          {title}
        </Title>
        
        {excerpt && (
          <Paragraph className={styles.articleExcerpt}>
            {excerpt}
          </Paragraph>
        )}

        {featuredImage && (
          <div className={styles.featuredImageContainer}>
            <Image
              src={featuredImage}
              alt={title}
              className={styles.featuredImage}
              preview={false}
            />
            {featuredImage.caption && (
              <Text type="secondary" className={styles.imageCaption}>
                {featuredImage.caption}
              </Text>
            )}
          </div>
        )}

        <div 
          className={styles.articleContent}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {tags.length > 0 && (
          <div className={styles.tagsContainer}>
            <TagOutlined className={styles.tagIcon} />
            {tags.map(tag => (
              <Tag key={tag} className={styles.tag}>
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </Card>

      {relatedNews.length > 0 && (
        <div className={styles.relatedNews}>
          <Divider orientation="left">
            <Title level={4}>Related Articles</Title>
          </Divider>
          <Row gutter={[24, 24]}>
            {relatedNews.map(item => (
              <Col xs={24} md={8} key={item._id}>
                <Card
                  hoverable
                  className={styles.relatedCard}
                  cover={
                    <div className={styles.relatedImageContainer}>
                      <img
                        alt={item.title}
                        src={item.featuredImage || 'https://via.placeholder.com/300x200'}
                        className={styles.relatedImage}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/news/${item._id}`)}
                >
                  <div className={styles.relatedContent}>
                    <Tag color={item.category?.color || 'blue'} className={styles.relatedTag}>
                      {item.category?.name || 'News'}
                    </Tag>
                    <Title level={5} className={styles.relatedTitle}>
                      {item.title}
                    </Title>
                    <Text type="secondary" className={styles.relatedDate}>
                      {moment(item.publishedAt).format('MMMM D, YYYY')}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default NewsDetail;
