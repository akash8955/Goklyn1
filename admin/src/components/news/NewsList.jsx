import React from 'react';
import { Row, Col, Card, Button, Space, Typography, Spin, Empty, Tag, Image } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import './news.css';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const NewsCard = ({ article, onEdit, onDelete, showActions }) => {
  const { _id, title, excerpt, featuredImage, status, publishedAt, author } = article;
  
  const statusProps = {
    published: {
      color: 'success',
      text: 'Published',
      icon: <CheckCircleOutlined />
    },
    draft: {
      color: 'warning',
      text: 'Draft',
      icon: <FileTextOutlined />
    },
    scheduled: {
      color: 'processing',
      text: 'Scheduled',
      icon: <ClockCircleOutlined />
    }
  };

  const statusInfo = statusProps[status] || statusProps.draft;
  
  return (
    <Card 
      className="news-card"
      hoverable
      cover={
        <div className="news-card-cover">
          <Image
            src={featuredImage || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={title}
            preview={false}
            className="news-image"
          />
          <Tag 
            color={statusInfo.color} 
            className="status-tag"
            icon={statusInfo.icon}
          >
            {statusInfo.text}
          </Tag>
        </div>
      }
    >
      <div className="news-card-body">
        <div className="news-meta">
          <Text type="secondary">
            {dayjs(publishedAt).format('MMM D, YYYY')}
          </Text>
          {author && (
            <Text type="secondary">
              • By {typeof author === 'object' ? author.name : author}
            </Text>
          )}
        </div>
        
        <Title level={4} className="news-title" ellipsis={{ rows: 2 }}>
          <Link to={`/news/${_id}`}>{title}</Link>
        </Title>
        
        <Text className="news-excerpt" ellipsis={{ rows: 3 }}>
          {excerpt}
        </Text>
        
        {showActions && (
          <div className="news-actions">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => window.open(`/news/${_id}`, '_blank')}
              title="Preview"
            />
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(article)}
              title="Edit"
            />
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => onDelete(_id)}
              title="Delete"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

const NewsList = ({ 
  articles = [], 
  loading = false, 
  error = null, 
  isEmpty = false,
  onRefresh,
  onEdit,
  onDelete,
  title = 'News Articles',
  showCreateButton = true,
  grid = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 },
  showActions = true
}) => {
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading articles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <ExclamationCircleOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
        <Title level={4} style={{ marginBottom: 8 }}>Error Loading Articles</Title>
        <Text type="secondary">{error}</Text>
        <div style={{ marginTop: 24 }}>
          <Button 
            type="primary" 
            onClick={onRefresh}
            icon={<ReloadOutlined />}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return <Empty 
      description="No news articles found"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    >
      <Button type="primary" onClick={onRefresh}>
        Refresh
      </Button>
    </Empty>;
  }

  return (
    <div className="news-list-container">
      <div className="news-list-header">
        <Title level={4} className="news-list-title">
          {title}
          <span className="news-count">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'}
          </span>
        </Title>
        
        {showCreateButton && (
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => window.location.href = '/news/new'}
            >
              Create News
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={onRefresh}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        )}
      </div>

      <Row gutter={[16, 16]} className="news-grid">
        {articles.map((article) => (
          <Col key={article._id || article.slug} {...grid}>
            <NewsCard 
              article={article} 
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={showActions}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default NewsList;
