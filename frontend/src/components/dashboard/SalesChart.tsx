
import { useSalesData } from "../../hooks";
import SalesLineChart from "../LineChart";



const SalesChart = () => {
  const { data, isLoading, isError } = useSalesData();

  if (isLoading) return <p>Loading sales data...</p>;
  if (isError) return <p>Failed to fetch sales data.</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">
      Monthly Sales Volume
    </h2>
    <SalesLineChart data={data} />
  </div>
  );
};

export default SalesChart;
