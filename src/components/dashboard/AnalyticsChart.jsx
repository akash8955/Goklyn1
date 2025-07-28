import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const AnalyticsChart = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This will ensure the component is only rendered on the client side
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading chart...</div>;
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Site Analytics (Last 6 Months)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#93c5fd" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;
