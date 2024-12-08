import { useOrderSalesByPlatformandMonth } from "../../hooks";
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
// Line graph component
const SalesLineChart = ({ data }: { data: any }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        
        {/* Render X axis for months */}
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        
        {/* Render Y axis (normalized percentage values) */}
        <YAxis tickFormatter={(value: number) => `${value.toFixed(2)}%`} tick={{ fontSize: 12 }} />
        
        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
        <Legend />
        
        {/* Render one line per platform */}
        {["Amazon", "Flipkart", "Meesho"].map((platform) => (
          <Line
            key={platform}
            type="monotone"
            dataKey={platform}
            stroke={
              platform === "Amazon"
                ? "#8884d8"
                : platform === "Flipkart"
                ? "#82ca9d"
                : "#ffc658"
            }
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Main SalesChart component
const OrderSalesChart = () => {
  const { data, isLoading, isError } = useOrderSalesByPlatformandMonth();

  if (isLoading) return <p>Loading sales data...</p>;
  if (isError) return <p>Failed to fetch sales data.</p>;

  // Reformat data to aggregate normalized-sales-percentage by month for all platforms
  const aggregatedData = data.reduce((acc: { month: any; Amazon: number; Flipkart: number; Meesho: number; }[], curr: { month: any; platform: string; normalized_sales_percentage: number; }) => {
    const monthEntry = acc.find((item: { month: any; }) => item.month === curr.month);

    if (monthEntry) {
      // Sum the normalized sales percentages for each platform by month
      monthEntry["Amazon"] += curr.platform === "Amazon"
        ? parseFloat(curr.normalized_sales_percentage.toFixed(2))
        : 0;
      monthEntry["Flipkart"] += curr.platform === "Flipkart"
        ? parseFloat(curr.normalized_sales_percentage.toFixed(2))
        : 0;
      monthEntry["Meesho"] += curr.platform === "Meesho"
        ? parseFloat(curr.normalized_sales_percentage.toFixed(2))
        : 0;
    } else {
      acc.push({
        month: curr.month,
        "Amazon": curr.platform === "Amazon"
          ? parseFloat(curr.normalized_sales_percentage.toFixed(2))
          : 0,
        "Flipkart": curr.platform === "Flipkart"
          ? parseFloat(curr.normalized_sales_percentage.toFixed(2))
          : 0,
        "Meesho": curr.platform === "Meesho"
          ? parseFloat(curr.normalized_sales_percentage.toFixed(2))
          : 0,
      });
    }

    return acc;
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Normalized Sales Percentage Trends by Platform Over Time
      </h2>
      <SalesLineChart data={aggregatedData} />
    </div>
  );
};

export default OrderSalesChart;
