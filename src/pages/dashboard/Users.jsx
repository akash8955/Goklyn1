import React from 'react';

const DashboardUsers = () => {
  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Users</h2>
        <button className="btn btn-primary">Add New User</button>
      </div>
      
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#1001</td>
                <td>John Doe</td>
                <td>john@example.com</td>
                <td>Admin</td>
                <td><span className="badge bg-success">Active</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                  <button className="btn btn-sm btn-outline-danger">Suspend</button>
                </td>
              </tr>
              {/* Add more user rows as needed */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardUsers;
