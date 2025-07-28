import React from 'react';
import { Layout, Typography, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import NewsList from './NewsList';
import styles from './news.module.css';

const { Content } = Layout;
const { Title } = Typography;

const NewsPage = () => {
  const navigate = useNavigate();

  return (
    <Layout className={styles.newsLayout}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div>
            <Title level={3} className={styles.pageTitle}>
              News Management
            </Title>
            <p className={styles.pageSubtitle}>
              Create, manage, and publish news articles
            </p>
          </div>
          <Space>
            <Link to="/news/create">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                size="large"
                className={styles.createButton}
              >
                New Article
              </Button>
            </Link>
          </Space>
        </div>
      </div>
      
      <Content className={styles.pageContent}>
        <div className={styles.contentWrapper}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default NewsPage;
