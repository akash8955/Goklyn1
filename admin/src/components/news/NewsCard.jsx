import React from 'react';
import { Card, Tag, Button, Space, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const { Text, Title } = Typography;

const NewsCard = ({ 
  article, 
  onEdit, 
  onDelete,
  showActions = true
}) => {
  const { 
    _id,
    title,
    excerpt,
    featuredImage,
    status,
    publishedAt,
    slug
  } = article;

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Card
      hoverable
      className="news-card"
      cover={
        <div className="news-image-container">
          <img 
            alt={title} 
            src={featuredImage || 'https://via.placeholder.com/300x200?text=No+Image'} 
            className="news-image"
          />
          <Tag color={getStatusColor(status)} className="status-tag">
            {status?.toUpperCase()}
          </Tag>
        </div>
      }
    >
      <div className="news-content">
        <Title level={5} className="news-title" ellipsis={{ rows: 2 }}>
          {title}
        </Title>
        
        <div className="news-meta">
          <Space size="middle">
            <Text type="secondary">
              <CalendarOutlined /> {format(new Date(publishedAt || new Date()), 'MMM d, yyyy')}
            </Text>
          </Space>
        </div>
        
        <Text className="news-excerpt" ellipsis={{ rows: 2 }}>
          {excerpt}
        </Text>
        
        {showActions && (
          <div className="news-actions">
            <Space size="middle">
              <Link to={`/news/${_id || slug}`} target="_blank" rel="noopener noreferrer">
                <Button icon={<EyeOutlined />} size="small">View</Button>
              </Link>
              <Button 
                icon={<EditOutlined />} 
                size="small"
                onClick={() => onEdit?.(article)}
              >
                Edit
              </Button>
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
                onClick={() => onDelete?.(_id)}
              >
                Delete
              </Button>
            </Space>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NewsCard;
