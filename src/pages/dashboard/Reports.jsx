import React from 'react';

const DashboardReports = () => {
  return (
    <div className="fade-in">
      <h2 className="mb-4">Reports</h2>
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Sales Report</h5>
              <p className="card-text">View and analyze your sales data.</p>
              <button className="btn btn-outline-primary">Generate Report</button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">User Activity</h5>
              <p className="card-text">Track user interactions and behavior.</p>
              <button className="btn btn-outline-primary">View Activity</button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Product Performance</h5>
              <p className="card-text">Analyze product sales and performance.</p>
              <button className="btn btn-outline-primary">View Report</button>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Export Data</h5>
              <p className="card-text">Export your data in various formats.</p>
              <button className="btn btn-outline-primary">Export Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardReports;
