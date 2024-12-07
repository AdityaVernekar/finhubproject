import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RevenueBarChart = ({
  data,
  xdataKey = "month",
  yDataKey = "revenue",
  tooltipName="Revenue: ₹"
}) => {
  // Custom Tooltip
  const CustomTooltip = ({ payload, label }) => {
    if (payload && payload.length) {
      const revenue = payload[0].value;
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
          <p>{tooltipName}{revenue.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart barSize={15} data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
        <XAxis
          dataKey={xdataKey}
          tick={{ fontSize: 12, fill: "#555" }}
          tickMargin={10}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#555" }}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={yDataKey} fill="#1F2253" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueBarChart;
