import SummaryMetrics from "../../components/SummaryMetrics";
import SalesLineChart from "../../components/LineChart";
import RevenueBarChart from "../../components/BarChart";
import FilterableTable from "../../components/FilterableTable";
import RevenueChart from "../../components/dashboard/RevenueBar";
import SalesChart from "../../components/dashboard/SalesChart";
import TopProductsList from "../../components/dashboard/TopProducts";
import OrderSalesChart from "../../components/dashboard/OrderByPlatform";

const Dashboard = () => {
  return (
    <main className="min-h-screen p-4">
      {/* Header */}
      <header className=" text-black py-6 px-8 rounded-lg text-left">
        <h4 className="text-3xl font-semibold mb-2">Welcome to Fihub</h4>
        <p className="text-lg font-medium">
          Track your sales, revenue, and performance at a glance.
        </p>
      </header>

      {/* Summary Metrics Section */}
      <section className="mt-8">
        <SummaryMetrics />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Sales Line Chart */}
        <SalesChart/>

        {/* Revenue Bar Chart */}
        <RevenueChart/>
        <TopProductsList/>
        <OrderSalesChart/>
      </section>

      {/* Filterable Table Section */}
      <section className="bg-white p-6 rounded-lg shadow-lg mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Sales Data Table
        </h2>
        <FilterableTable/>
      </section>
    </main>
  );
};

export default Dashboard;
