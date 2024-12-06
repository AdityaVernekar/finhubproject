import "./App.css";
import RevenueBarChart from "./components/BarChart";
import FilterableTable from "./components/FilterableTable";
import SalesLineChart from "./components/LineChart";
import SummaryMetrics from "./components/SummaryMetrics";

function App() {
  return (
    <main className="min-h-screen p-4">
      {/* Header */}
      <header className=" text-black py-6 px-8 rounded-lg text-left">
        <h4 className="text-3xl font-semibold mb-2">Welcome Back, Admin</h4>
        <p className="text-lg font-medium">
          Track your sales, revenue, and performance at a glance.
        </p>
      </header>

      {/* Summary Metrics Section */}
      <section className="mt-8">
        <SummaryMetrics
          metrics={{
            total_revenue: 100000,
            total_orders: 25,
            total_products_sold: 75,
            canceled_order_percentage: 5,
          }}
        />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Sales Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Monthly Sales Volume
          </h2>
          <SalesLineChart
            data={{
              labels: [
                "Jan 2024",
                "Feb 2024",
                "Mar 2024",
                "Apr 2024",
                "May 2024",
                "Jun 2024",
                "Jul 2024",
                "Aug 2024",
                "Sep 2024",
                "Oct 2024",
                "Nov 2024",
                "Dec 2024",
              ],
              data: [150, 200, 250, 300, 400, 500, 600, 700, 800, 850, 900, 1000],
            }}
          />
        </div>

        {/* Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Monthly Revenue
          </h2>
          <RevenueBarChart
            data={{
              labels: [
                "Jan 2024",
                "Feb 2024",
                "Mar 2024",
                "Apr 2024",
                "May 2024",
                "Jun 2024",
                "Jul 2024",
                "Aug 2024",
                "Sep 2024",
                "Oct 2024",
                "Nov 2024",
                "Dec 2024",
              ],
              data: [
                50000, 60000, 70000, 75000, 80000, 85000, 90000, 95000, 100000,
                110000, 120000, 130000,
              ],
            }}
          />
        </div>
      </section>

      {/* Filterable Table Section */}
      <section className="bg-white p-6 rounded-lg shadow-lg mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Sales Data Table
        </h2>
        <FilterableTable
          data={[
            {
              order_id: "ORD123",
              customer: { customer_name: "John Doe" },
              product: { product_name: "Product A", category: "Electronics" },
              quantity_sold: 2,
              total_sale_value: 200,
              date_of_sale: "2024-01-10",
            },
            {
              order_id: "ORD124",
              customer: { customer_name: "Jane Doe" },
              product: { product_name: "Product B", category: "Apparel" },
              quantity_sold: 3,
              total_sale_value: 300,
              date_of_sale: "2024-02-15",
            },
          ]}
        />
      </section>
    </main>
  );
}

export default App;
