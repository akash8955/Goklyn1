import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Table, 
  Button, 
  Input,
  Select, 
  Tag, 
  Dropdown, 
  Menu, 
  message, 
  Tooltip,
  Typography,
  Card,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  MoreOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarFilled,
  ReloadOutlined,
  EditOutlined
} from '@ant-design/icons';
import moment from 'moment';
import debounce from 'lodash/debounce';
import { useNews } from '../../contexts/NewsContext';
import styles from './news.module.css';

const { Text } = Typography;
const { Option } = Select;

const NewsList = () => {
  const navigate = useNavigate();
  const {
    news,
    loading,
    pagination,
    filters,
    categories,
    selectedRows,
    fetchNews,
    updateFilters,
    bulkDeleteNews,
    setSelectedRows
  } = useNews();
  
  const [searchText, setSearchText] = useState('');
  // Add local state for filters and pagination if not provided by context
  const [localFilters, setFilters] = useState(filters || {});
  const [localPagination, setPagination] = useState(pagination || {});

  const handleSearch = useCallback(
    debounce((value) => {
      setFilters(prev => ({
        ...prev,
        search: value,
      }));
      setPagination(prev => ({
        ...prev,
        current: 1,
      }));
    }, 500),
    [setFilters, setPagination]
  );

  const handleFilterChange = (field, value) => {
    updateFilters({ [field]: value });
    fetchNews();
  };

  const handleTableChange = (pagination, filters, sorter) => {
    fetchNews({
      pagination,
      filters,
      sorter,
    });
  };

  const handleDelete = async (id) => {
    try {
      await bulkDeleteNews([id]);
      message.success('Article deleted successfully');
      fetchNews();
    } catch (error) {
      console.error('Error deleting article:', error);
      message.error('Failed to delete article');
    }
  };

  const handleBulkAction = async (action) => {
    if (action === 'delete') {
      try {
        await bulkDeleteNews(selectedRows);
        message.success('Articles deleted successfully');
        fetchNews();
      } catch (error) {
        console.error('Error deleting articles:', error);
        message.error('Failed to delete articles');
      }
    }
  };

  const rowSelection = {
    selectedRows,
    onChange: setSelectedRows,
  };

  const bulkActionsMenu = (
    <Menu>
      <Menu.Item 
        key="delete" 
        danger
        icon={<DeleteOutlined />}
        onClick={() => handleBulkAction('delete')}
      >
        Delete Selected
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text, record) => (
        <div className={styles.newsTitleCell}>
          <Link to={`/news/${record._id}`} className={styles.newsTitle}>
            {text}
          </Link>
          <div className={styles.newsMeta}>
            <Text type="secondary" className={styles.newsAuthor}>
              {record.author?.name || 'Admin'}
            </Text>
            <Text type="secondary" className={styles.newsDate}>
              {moment(record.createdAt).fromNow()}
            </Text>
            {record.featured && (
              <Tag icon={<StarFilled />} color="gold" className={styles.featuredTag}>
                Featured
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      filters: categories.map(cat => ({ text: cat.name, value: cat._id })),
      filteredValue: filters.category ? [filters.category] : null,
      render: (category) => (
        <Tag color={category?.color || 'blue'} className={styles.categoryTag}>
          {category?.name || 'Uncategorized'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' },
        { text: 'Scheduled', value: 'scheduled' },
        { text: 'Archived', value: 'archived' },
      ],
      filteredValue: filters.status ? [filters.status] : null,
      render: (status) => {
        const statusMap = {
          published: { 
            text: 'Published', 
            color: 'success',
            icon: <CheckCircleOutlined /> 
          },
          draft: { 
            text: 'Draft', 
            color: 'default',
            icon: <ClockCircleOutlined /> 
          },
          scheduled: { 
            text: 'Scheduled', 
            color: 'processing',
            icon: <ClockCircleOutlined /> 
          },
          archived: { 
            text: 'Archived', 
            color: 'warning',
            icon: <ClockCircleOutlined /> 
          },
        };
        const statusInfo = statusMap[status] || { 
          text: 'Unknown', 
          color: 'default',
          icon: null 
        };
        return (
          <Tag 
            color={statusInfo.color} 
            icon={statusInfo.icon}
            className={styles.statusTag}
          >
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: 'Publish Date',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 150,
      sorter: true,
      render: (date) => (
        <div className={styles.dateCell}>
          {date ? (
            <>
              <div>{moment(date).format('MMM D, YYYY')}</div>
              <div className={styles.timeText}>
                {moment(date).format('h:mm A')}
              </div>
            </>
          ) : (
            <Text type="secondary">-</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item 
              key="view" 
              icon={<EyeOutlined />}
              onClick={() => navigate(`/news/${record._id}`)}
            >
              View
            </Menu.Item>
            <Menu.Item 
              key="edit" 
              icon={<EditOutlined />}
              onClick={() => navigate(`/news/edit/${record._id}`)}
            >
              Edit
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item 
              key="delete" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            >
              Delete
            </Menu.Item>
          </Menu>
        );

        return (
          <div className={styles.actionsCell}>
            <Tooltip title="View">
              <Button 
                type="text" 
                icon={<EyeOutlined />} 
                onClick={() => navigate(`/news/${record._id}`)}
                className={styles.actionButton}
              />
            </Tooltip>
            <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
              <Button 
                type="text" 
                icon={<MoreOutlined />} 
                className={styles.moreButton}
              />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.newsListContainer}>
      <div className={styles.toolbar}>
        <div className={styles.searchBar}>
          <Input.Search
            placeholder="Search articles..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              handleSearch(e.target.value);
            }}
            className={styles.searchInput}
          />
          <Select
            placeholder="Status"
            allowClear
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            className={styles.filterSelect}
          >
            <Option value="published">Published</Option>
            <Option value="draft">Draft</Option>
            <Option value="scheduled">Scheduled</Option>
            <Option value="archived">Archived</Option>
          </Select>
          <Select
            placeholder="Category"
            allowClear
            value={filters.category}
            onChange={(value) => handleFilterChange('category', value)}
            className={styles.filterSelect}
            loading={!categories.length}
          >
            {categories.map((category) => (
              <Option key={category._id} value={category._id}>
                {category.name}
              </Option>
            ))}
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchNews()}
            className={styles.refreshButton}
          >
            Refresh
          </Button>
        </div>
        
        <div className={styles.toolbarActions}>
          {selectedRows.length > 0 && (
            <Dropdown overlay={bulkActionsMenu} trigger={['click']}>
              <Button className={styles.bulkActionsButton}>
                Bulk Actions <MoreOutlined />
              </Button>
            </Dropdown>
          )}
          <Link to="/news/create">
            <Button type="primary" icon={<PlusOutlined />}>
              New Article
            </Button>
          </Link>
        </div>
      </div>

      <Card className={styles.tableCard} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={news}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} articles`,
            size: 'default',
            position: ['bottomRight'],
          }}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    No articles found. <Link to="/news/create">Create one</Link>?
                  </span>
                }
              />
            ),
          }}
          className={styles.newsTable}
        />
      </Card>
    </div>
  );
};

export default NewsList;
