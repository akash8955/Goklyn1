import React, { useEffect, useState } from 'react';
import api from '../../api';
import CrudForm from './CrudForm';


const API_ENDPOINTS = {
  projects: '/projects',
  testimonials: '/testimonials',
  internships: '/internships',
};

const CrudTable = ({ section, formState, onFormStateChange }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { show: showForm, selectedItem } = formState || {};

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(API_ENDPOINTS[section]);
      setItems(res.data);
    } catch (err) {
      setError('Failed to fetch data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, [section]);

  const handleEdit = (id) => {
    const item = items.find((i) => i._id === id);
    onFormStateChange({ show: true, selectedItem: item });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`${API_ENDPOINTS[section]}/${id}`);
      setItems(items.filter((item) => item._id !== id));
    } catch {
      alert('Failed to delete.');
    }
  };

  const handleAdd = () => {
    onFormStateChange({ show: true, selectedItem: null });
  };

  const handleFormSuccess = () => {
    onFormStateChange({ show: false, selectedItem: null });
    fetchItems();
  };

  const handleFormCancel = () => {
    onFormStateChange({ show: false, selectedItem: null });
  };

  return (
    <div>
      <div className="table-container">
        <div className="table-header">
          <h3>Manage {section.charAt(0).toUpperCase() + section.slice(1)}</h3>
          <button className="add-btn" onClick={handleAdd}>
            + Add New {section.slice(0, -1)}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-wrapper">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Name/Title</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item._id}>
                      <td className="item-name">
                        {item.clientName || item.name || item.title || 'Untitled'}
                      </td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEdit(item._id)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(item._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="no-items">No {section} found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .table-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }
          
          .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .crud-table-h3 {
            margin: 0;
            color: #1a1a1a;
            font-size: 1.1rem;
            font-weight: 600;
          }
          
          .add-btn {
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          .add-btn:hover {
            background: #1d4ed8;
          }
          
          .error-message {
            background: #fee2e2;
            color: #b91c1c;
            padding: 10px 20px;
            margin: 10px 20px;
            border-radius: 4px;
            font-size: 0.9rem;
          }
          
          .loading {
            padding: 20px;
            text-align: center;
            color: #64748b;
          }
          
          .table-wrapper {
            overflow-x: auto;
          }
          
          .crud-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .crud-table th {
            background: #f8fafc;
            color: #475569;
            text-align: left;
            padding: 12px 20px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e2e8f0;
          }
          
          .crud-table td {
            padding: 15px 20px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
            font-size: 0.95rem;
          }
          
          .crud-table tr:hover td {
            background: #f8fafc;
          }
          
          .item-name {
            font-weight: 500;
            color: #1e293b;
          }
          
          .actions {
            display: flex;
            gap: 10px;
          }
          
          .edit-btn, .delete-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .edit-btn {
            background: #e0f2fe;
            color: #0369a1;
          }
          
          .edit-btn:hover {
            background: #bae6fd;
          }
          
          .delete-btn {
            background: #fee2e2;
            color: #b91c1c;
          }
          
          .delete-btn:hover {
            background: #fecaca;
          }
          
          .no-items {
            text-align: center;
            color: #64748b;
            padding: 30px;
            font-style: italic;
          }
        `
      }} />
      
      {showForm && (
        <CrudForm
          section={section}
          item={selectedItem}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default CrudTable;
