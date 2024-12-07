import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const SalesLineChart = ({ data }) => {
  const CustomTooltip = ({ payload, label }) => {
    if (payload && payload.length) {
      const quantity = payload[0].value;
      return (
        <div
          style={{
            backgroundColor: "#333",
            padding: "10px",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "14px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <p>
            <strong>{label}</strong>
          </p>
          <p>Quantity Sold: {quantity.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#555" }}
          tickMargin={10}
        />
        <YAxis tick={{ fontSize: 12, fill: "#555" }} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="quantity"
          stroke="#1F2253"
          strokeWidth={3}
          dot={{ r: 4, fill: "#1F2253" }}
          activeDot={{ r: 6, fill: "#BED0FF" }}
          animationDuration={1000}
        />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{
            fontSize: "12px",
            color: "#555",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesLineChart;
