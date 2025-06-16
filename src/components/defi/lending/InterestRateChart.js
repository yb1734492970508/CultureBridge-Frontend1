import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './styles/InterestRateChart.css';

const data = [
  { name: 'Jan', supply: 2.5, borrow: 4.0 },
  { name: 'Feb', supply: 2.7, borrow: 4.2 },
  { name: 'Mar', supply: 2.9, borrow: 4.5 },
  { name: 'Apr', supply: 3.1, borrow: 4.8 },
  { name: 'May', supply: 3.3, borrow: 5.0 },
  { name: 'Jun', supply: 3.5, borrow: 5.2 },
];

const InterestRateChart = () => {
  return (
    <div className="interest-rate-chart">
      <h2>利率趋势</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="supply" stroke="var(--success-color)" activeDot={{ r: 8 }} name="存款利率" />
          <Line type="monotone" dataKey="borrow" stroke="var(--error-color)" name="借款利率" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InterestRateChart;


