import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SalesLineChart = ({ data }) => {
  const formattedData = data.labels.map((label, index) => ({
    month: label,
    quantity: data.data[index],
  }));

  // Custom Tooltip for better user experience
  const CustomTooltip = ({ payload, label }) => {
    if (payload && payload.length) {
      const quantity = payload[0].value;
      return (
        <div
          style={{
            backgroundColor: "#333", // Dark background for better contrast
            padding: "10px",
            borderRadius: "8px",
            color: "#fff", // White text
            fontSize: "14px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <p><strong>{label}</strong></p>
          <p>Quantity: {quantity.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        {/* Cartesian Grid Styling */}
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        
        {/* X Axis Customization */}
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#555" }}
          tickMargin={10}
        />
        
        {/* Y Axis Customization */}
        <YAxis tick={{ fontSize: 12, fill: "#555" }} />

        {/* Custom Tooltip */}
        <Tooltip content={<CustomTooltip />} />

        {/* Line Styling */}
        <Line
          type="monotone"
          dataKey="quantity"
          stroke="#42a5f5"
          strokeWidth={3}
          dot={{ r: 4, fill: "#42a5f5" }} // Customize line dots
          activeDot={{ r: 6, fill: "#1976d2" }} // Active dot styling
          animationDuration={1000} // Smooth animation for line drawing
        />
        
        {/* Legend */}
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{
            fontSize: '12px',
            color: '#555',
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesLineChart;
