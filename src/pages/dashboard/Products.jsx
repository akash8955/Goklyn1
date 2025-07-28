import React from 'react';

const DashboardProducts = () => {
  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Products</h2>
        <button className="btn btn-primary">Add New Product</button>
      </div>
      
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#1001</td>
                <td>Premium Widget</td>
                <td>Widgets</td>
                <td>$49.99</td>
                <td>125</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                  <button className="btn btn-sm btn-outline-danger">Delete</button>
                </td>
              </tr>
              {/* Add more product rows as needed */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardProducts;
