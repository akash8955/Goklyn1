import React from 'react';
import { Empty, Button, Typography, Card } from 'antd';
import { PlusOutlined, ReloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const EmptyNewsState = ({ onRefresh }) => {
  const navigate = useNavigate();
  
  const handleCreateClick = () => {
    navigate('/news/create');
  };

  return (
    <Card className="empty-news-container">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="empty-news-content">
            <FileTextOutlined className="empty-icon" />
            <Title level={4} className="empty-title">No Articles Found</Title>
            <Text type="secondary" className="empty-description">
              There are no news articles to display. Create your first article to get started.
            </Text>
          </div>
        }
      >
        <div className="empty-actions">
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateClick}
            className="create-button"
          >
            Create Your First Article
          </Button>
          <Button 
            type="text" 
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            className="refresh-button"
          >
            Refresh
          </Button>
        </div>
      </Empty>
    </Card>
  );
};

export default EmptyNewsState;
