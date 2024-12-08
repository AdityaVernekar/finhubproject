import { useRevenueData } from "../../hooks";
import RevenueBarChart from "../BarChart";



const RevenueChart = () => {
  const { data, isLoading, isError } = useRevenueData();

  if (isLoading) return <p>Loading revenue data...</p>;
  if (isError) return <p>Failed to fetch revenue data.</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Monthly Revenue
          </h2>
          <RevenueBarChart data={data} />
        </div>
  );
};

export default RevenueChart;
