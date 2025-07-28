import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Table, 
  Tag, 
  message, 
  Modal,
  Image, 
  Input, 
  Select, 
  Badge,
  Dropdown,
  Menu,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  VideoCameraOutlined,
  PictureOutlined,
  MoreOutlined,
  StarOutlined,
  StarFilled,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { debounce } from 'lodash';
import { useGallery } from '../../contexts/GalleryContext';
import galleryService from '../../services/galleryService';
import styles from './gallery.module.css';

const { Search } = Input;
const { Option } = Select;

const GalleryList = () => {
  const navigate = useNavigate();
  const { albums, loading: albumsLoading } = useGallery();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchInput = useRef(null);

  // Fetch gallery items with filters and pagination
  const fetchGalleryItems = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await galleryService.getGalleryItems({
        page: params.pagination?.current || 1,
        limit: params.pagination?.pageSize || 10,
        search: searchText,
        ...params.filters,
        sortField: params.sortField,
        sortOrder: params.sortOrder,
      });
      
      setGalleryItems(response.data);
      setPagination({
        current: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (error) {
      message.error('Failed to fetch gallery items');
      console.error('Error fetching gallery items:', error);
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  // Delete a gallery item
  const deleteGalleryItem = async (id) => {
    try {
      await galleryService.deleteGalleryItem(id);
      message.success('Gallery item deleted successfully');
      fetchGalleryItems({
        pagination,
        filters,
      });
    } catch (error) {
      if (error && typeof error === 'string' && error.includes('requests too quickly')) {
      message.error(error, 5);
      return;
    }
    message.error('Failed to delete gallery item');
      console.error('Error deleting gallery item:', error);
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id, isFeatured) => {
    try {
      await galleryService.updateGalleryItem(id, { isFeatured: !isFeatured });
      message.success(`Item ${isFeatured ? 'removed from' : 'added to'} featured`);
      fetchGalleryItems({
        pagination,
        filters,
      });
    } catch (error) {
      message.error('Failed to update featured status');
      console.error('Error toggling featured status:', error);
    }
  };

  // Handle search with debounce
  const debouncedSearch = useCallback(
    (value) => {
      const debouncedFn = debounce((val) => {
        fetchGalleryItems({
          pagination: { ...pagination, current: 1 },
          filters,
          searchText: val,
        });
      }, 500);
      
      debouncedFn(value);
      
      // Cleanup function
      return () => debouncedFn.cancel();
    },
    [fetchGalleryItems, filters, pagination]
  );

  const handleSearch = (value) => {
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchGalleryItems({
      pagination: { ...pagination, current: 1 },
      filters: newFilters,
    });
  };

  // Fetch once on mount
  useEffect(() => {
    fetchGalleryItems({
      pagination,
      filters,
      searchText,
    });
    // eslint-disable-next-line
  }, []);

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
    getCheckboxProps: (record) => ({
      disabled: false,
      name: record.title || 'gallery-item',
    }),
  };

  const handleTableChange = (pagination, filters, sorter) => {
    fetchGalleryItems({
      pagination: {
        ...pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    });
  };

  const handleBulkAction = (action, ids) => {
    switch (action) {
      case 'delete':
        Modal.confirm({
          title: 'Delete Selected Items',
          content: `Are you sure you want to delete ${ids.length} selected items?`,
          okText: 'Delete',
          okType: 'danger',
          cancelText: 'Cancel',
          onOk: async () => {
            try {
              // Use the efficient bulk delete endpoint
              await galleryService.deleteMultipleGalleryItems(ids);
              setSelectedRowKeys([]);
              message.success(`Successfully deleted ${ids.length} items`);
              // Refetch data to update the table
              fetchGalleryItems({ pagination, filters });
            } catch (error) {
              console.error('Error deleting items:', error);
              message.error('Failed to delete selected items');
            }
          },
        });
        break;
      case 'feature':
        Modal.confirm({
          title: 'Update Featured Status',
          content: `Mark ${ids.length} selected items as featured?`,
          okText: 'Mark as Featured',
          cancelText: 'Cancel',
          onOk: async () => {
            try {
              await Promise.all(ids.map(id => 
                galleryService.updateGalleryItem(id, { isFeatured: true })
              ));
              setSelectedRowKeys([]);
              message.success(`Marked ${ids.length} items as featured`);
              // Refetch data with current view settings
              fetchGalleryItems({ pagination, filters });
            } catch (error) {
              console.error('Error featuring items:', error);
              message.error('Failed to update featured status');
            }
          },
        });
        break;
      default:
        break;
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Delete Gallery Item',
      content: 'Are you sure you want to delete this item? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteGalleryItem(id);
        } catch (error) {
          console.error('Error deleting gallery item:', error);
          throw error; // Let the modal handle the error
        }
      },
    });
  };

  const renderMediaPreview = (record) => {
    if (record.mediaType === 'image') {
      return (
        <Image
          width={80}
          height={60}
          src={record.mediaUrl}
          alt={record.title}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          preview={false}
        />
      );
    }
    return (
      <div className={styles.videoThumbnail}>
        <VideoCameraOutlined style={{ fontSize: 24 }} />
      </div>
    );
  };



  const actionMenu = (record) => (
    <Menu onClick={({ key }) => {
      const { _id, isFeatured, mediaUrl, title } = record;
      // Safety check to prevent actions on items without an ID
      if (!_id) {
        message.error('Cannot perform action: Item ID is missing.');
        return;
      }
      switch (key) {
        case 'view':
          if (mediaUrl) {
            window.open(mediaUrl, '_blank');
          }
          break;
        case 'edit':
          navigate(`/gallery/edit/${_id}`);
          break;
        case 'delete':
          handleDelete(_id);
          break;
        case 'download':
          // Prevent downloading from placeholder URLs
          if (mediaUrl && mediaUrl.includes('via.placeholder.com')) {
            message.error('This is a placeholder image and cannot be downloaded. Please edit the item and upload the correct file.');
            return;
          }

          const link = document.createElement('a');
          link.href = mediaUrl;
          link.download = title || 'download';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          break;
        case 'feature':
          toggleFeatured(_id, isFeatured);
          break;
        default:
          break;
      }
    }}>
      <Menu.Item key="view" icon={<EyeOutlined />}>View</Menu.Item>
      <Menu.Item key="edit" icon={<EditOutlined />}>Edit</Menu.Item>
      <Menu.Item key="feature" icon={record.isFeatured ? <StarFilled /> : <StarOutlined />}>
        {record.isFeatured ? 'Remove from featured' : 'Mark as featured'}
      </Menu.Item>
      <Menu.Item key="download" icon={<DownloadOutlined />}>Download</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" danger icon={<DeleteOutlined />}>Delete</Menu.Item>
    </Menu>
  );

  const handleRefresh = () => {
    fetchGalleryItems({
      pagination: { current: 1, pageSize: 10 },
      filters: {},
      sortField: 'createdAt',
      sortOrder: 'descend'
    });
    setSelectedRowKeys([]);
  };

  return (
    <div className={styles.galleryList}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h2>Gallery Management</h2>
          <div className={styles.headerActions}>
            <Button
              className={styles.actionButton}
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/gallery/upload')}
              className={styles.primaryButton}
            >
              Upload New
            </Button>
          </div>
        </div>
      </div>
      
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <Select
            className={styles.filterSelect}
            placeholder="Filter by album"
            allowClear
            onChange={(value) => handleFilterChange('album', value)}
            value={filters.album}
            loading={albumsLoading}
          >
            {albums.map(album => (
              <Option key={album.id} value={album.id}>
                {album.title}
              </Option>
            ))}
          </Select>

          <Select
            className={styles.filterSelect}
            placeholder="Status"
            allowClear
            onChange={(value) => handleFilterChange('status', value)}
            value={filters.status}
          >
            <Option value="published">Published</Option>
            <Option value="draft">Draft</Option>
            <Option value="archived">Archived</Option>
          </Select>

          <Select
            className={styles.filterSelect}
            placeholder="Featured"
            allowClear
            onChange={(value) => handleFilterChange('isFeatured', value)}
            value={filters.isFeatured}
          >
            <Option value={true}>Featured</Option>
            <Option value={false}>Not Featured</Option>
          </Select>

          <Search
            className={`${styles.searchInput} ${styles.filterSelect}`}
            placeholder="Search by title"
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
            prefix={<SearchOutlined />}
            ref={searchInput}
          />

          <Button
            className={styles.actionButton}
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchText('');
              setFilters({});
              setPagination({ ...pagination, current: 1 });
              if (searchInput.current) {
                searchInput.current.input.value = '';
              }
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      
      <div className={styles.tableContainer}>
        <Card>
          <div className={styles.tableHeader}>
            {selectedRowKeys.length > 0 && (
              <div className={styles.bulkActions}>
                <span className={styles.selectedCount}>
                  {selectedRowKeys.length} selected
                </span>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleBulkAction('delete', selectedRowKeys)}
                  className={styles.actionButton}
                >
                  Delete
                </Button>
                <Button
                  type="text"
                  icon={<StarOutlined />}
                  onClick={() => handleBulkAction('feature', selectedRowKeys)}
                  className={styles.actionButton}
                >
                  Mark as Featured
                </Button>
              </div>
            )}
          </div>
          
          <Table
            columns={[
              {
                title: 'Preview',
                key: 'preview',
                width: 120,
                render: (_, record) => renderMediaPreview(record)
              },
              {
                title: 'Title',
                dataIndex: 'title',
                key: 'title',
                sorter: true,
                render: (text, record) => (
                  <div className={styles.titleCell}>
                    <Link to={`/gallery/${record._id}`} className={styles.itemTitle}>
                      {text || 'Untitled'}
                    </Link>
                    {record.isFeatured && (
                      <Tag color="gold" style={{ marginLeft: 8 }}>
                        <StarFilled /> Featured
                      </Tag>
                    )}
                  </div>
                )
              },
              {
                title: 'Type',
                dataIndex: 'mediaType',
                key: 'type',
                width: 100,
                filters: [
                  { text: 'Image', value: 'image' },
                  { text: 'Video', value: 'video' },
                ],
                render: (mediaType) => (
                  <Tag 
                    color={mediaType === 'image' ? 'geekblue' : 'purple'}
                    icon={mediaType === 'image' ? <PictureOutlined /> : <VideoCameraOutlined />}
                  >
                    {mediaType ? mediaType.toUpperCase() : 'UNKNOWN'}
                  </Tag>
                )
              },
              {
                title: 'Album',
                dataIndex: ['album', 'title'],
                key: 'album',
                render: (albumName) => albumName || <Tag>No Album</Tag>,
                filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                  <div style={{ padding: 8 }}>
                    <Select
                      style={{ width: 200 }}
                      placeholder="Select album"
                      value={selectedKeys[0]}
                      onChange={(value) => {
                        setSelectedKeys(value ? [value] : []);
                        confirm();
                      }}
                      allowClear
                    >
                      {albums.map(album => (
                        <Option key={album.id} value={album.id}>
                          {album.title}
                        </Option>
                      ))}
                    </Select>
                  </div>
                ),
                onFilter: (value, record) => record.album?._id === value
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 120,
                filters: [
                  { text: 'Published', value: 'published' },
                  { text: 'Draft', value: 'draft' },
                  { text: 'Archived', value: 'archived' },
                ],
                render: (status) => {
                  const statusMap = {
                    published: { color: 'success', text: 'Published' },
                    draft: { color: 'processing', text: 'Draft' },
                    archived: { color: 'warning', text: 'Archived' },
                  };
                  const { color, text } = statusMap[status] || { color: 'default', text: 'Unknown' };
                  return <Badge status={color} text={text} />;
                }
              },
              {
                title: 'Actions',
                key: 'actions',
                width: 80,
                fixed: 'right',
                render: (_, record) => (
                  <Dropdown overlay={actionMenu(record)} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                )
              }
            ]}
            rowKey="_id"
            dataSource={galleryItems}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
            loading={loading}
            onChange={handleTableChange}
            rowSelection={rowSelection}
            scroll={{ x: 'max-content' }}
            rowClassName={(record) => record.isFeatured ? styles.featuredRow : ''}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span>No gallery items found. <Link to="/gallery/upload">Upload</Link> your first item.</span>
                  }
                />
              )
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default GalleryList;
