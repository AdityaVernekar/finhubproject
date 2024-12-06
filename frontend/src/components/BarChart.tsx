import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const RevenueBarChart = ({ data }) => {
  const formattedData = data.labels.map((label, index) => ({
    month: label,
    revenue: data.data[index],
  }));

  // Custom Tooltip formatting
  const CustomTooltip = ({ payload, label }) => {
    if (payload && payload.length) {
      const revenue = payload[0].value;
      return (
        <div
          style={{
            backgroundColor: "#333", // Dark tooltip background
            padding: "10px",
            borderRadius: "8px",
            color: "#fff", // White text
            fontSize: "14px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <p><strong>{label}</strong></p>
          <p>Revenue: ₹{revenue.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#555" }} />
        <YAxis tick={{ fontSize: 12, fill: "#555" }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" fill="#742dd2" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueBarChart;
