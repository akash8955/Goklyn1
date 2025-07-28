import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Tabs, 
  message,
  Modal,
  Spin,
  Result
} from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined,
  BookOutlined,
  FileDoneOutlined,
  EditOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import NewsList from '../components/news/NewsList';
import NewsForm from '../components/news/NewsForm';
import newsService from '../services/newsService';

const { Title, Text } = Typography;

const NewsListing = React.memo(({ onEdit, onDelete, onRefresh, articles = [], loading, error, isEmpty }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const filteredArticles = React.useMemo(() => {
    if (!Array.isArray(articles)) return [];
    if (activeTab === 'all') return articles;
    return articles.filter(article => article?.status === activeTab);
  }, [articles, activeTab]);
  
  // Memoize the NewsList props to prevent unnecessary re-renders
  const newsListProps = React.useMemo(() => ({
    articles: filteredArticles,
    loading,
    error,
    isEmpty: isEmpty || (!loading && filteredArticles.length === 0),
    onRefresh,
    onEdit,
    onDelete
  }), [filteredArticles, loading, error, isEmpty, onRefresh, onEdit, onDelete]);

  const tabs = [
    { key: 'all', tab: 'All Articles', icon: <BookOutlined /> },
    { key: 'published', tab: 'Published', icon: <FileDoneOutlined /> },
    { key: 'draft', tab: 'Drafts', icon: <EditOutlined /> },
  ];

  return (
    <div className="news-listing">
      <div className="page-header">
        <Title level={3} className="page-title">News Management</Title>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={onRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/news/create')}
          >
            New Article
          </Button>
        </Space>
      </div>

      <Card 
        className="news-container"
        tabList={tabs}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
      >
        <NewsList {...newsListProps} />
      </Card>
    </div>
  );
});

const NewsDetail = ({ id }) => {
  const navigate = useNavigate();
  const { data: article, isLoading, error } = useQuery(
    ['newsItem', id],
    () => newsService.getNewsItem(id),
    {
      enabled: !!id,
    }
  );

  if (isLoading) {
    return <div className="loading-container"><Spin size="large" /></div>;
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Failed to load article"
        subTitle={error.message}
        extra={[
          <Button type="primary" key="back" onClick={() => navigate('/news')}>
            Back to News
          </Button>,
        ]}
      />
    );
  }

  return (
    <div className="news-detail">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back to News
      </Button>
      
      <Card>
        {article && (
          <div className="article-content">
            <Title level={2}>{article.title}</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              Published on {new Date(article.publishedAt).toLocaleDateString()}
            </Text>
            
            {article.featuredImage && (
              <div className="featured-image" style={{ margin: '24px 0' }}>
                <img 
                  src={article.featuredImage} 
                  alt={article.title} 
                  style={{ maxWidth: '100%', borderRadius: 8 }}
                />
              </div>
            )}
            
            <div 
              className="article-body" 
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{ marginTop: 24 }}
            />
            
            <div style={{ marginTop: 32 }}>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => navigate(`/news/${id}/edit`)}
              >
                Edit Article
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

const NewsPage = React.memo(({ isCreate = false, isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  
  // Memoize query options to prevent unnecessary re-renders
  const queryOptions = React.useMemo(() => ({
    enabled: !id && !isCreate && !isEdit && isAuthenticated,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (err) => {
      console.error('News query error:', err);
    },
  }), [id, isCreate, isEdit, isAuthenticated]);
  
  // Fetch news articles for listing
  const { 
    data: articlesData = [], 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery(
    ['news', isAuthenticated],
    async () => {
      try {
        if (!isAuthenticated) return [];
        
        const response = await newsService.getNews({ limit: 100 });
        // Ensure we always return an array
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.results)) return response.results;
        return [];
      } catch (err) {
        console.error('Error fetching news:', err);
        return [];
      }
    },
    queryOptions
  );

  // Delete mutation
  const deleteMutation = useMutation(
    (id) => newsService.deleteNews(id),
    {
      onSuccess: () => {
        message.success('Article deleted successfully');
        queryClient.invalidateQueries('news');
        navigate('/news');
      },
      onError: (error) => {
        console.error('Error deleting article:', error);
        message.error(error.message || 'Failed to delete article');
      }
    }
  );

  const handleEdit = (article) => {
    navigate(`/news/${article._id || article.id}/edit`);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Article',
      content: 'Are you sure you want to delete this article? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteMutation.mutate(id),
      maskClosable: true,
      centered: true,
    });
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries('news');
    navigate('/news');
  };

  // Handle create form
  if (isCreate) {
    return (
      <div className="news-form-page">
        <NewsForm 
          onSuccess={handleSuccess}
          onCancel={() => navigate('/news')}
        />
      </div>
    );
  }

  // Handle edit form
  if (isEdit && id) {
    return (
      <div className="news-form-page">
        <NewsForm 
          id={id}
          isEdit
          onSuccess={handleSuccess}
          onCancel={() => navigate(`/news/${id}`)}
        />
      </div>
    );
  }

  // Handle detail view
  if (id) {
    return <NewsDetail id={id} />;
  }

  // Default: show listing
  return (
    <NewsListing
      articles={articlesData || []}
      loading={isLoading}
      error={isError ? (error?.message || 'Failed to load news') : null}
      isEmpty={!isLoading && (!articlesData || articlesData.length === 0)}
      onRefresh={refetch}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
});

export default NewsPage;
