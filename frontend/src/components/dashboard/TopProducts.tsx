


import React from "react";
import { useTopProducts } from "../../hooks";
import RevenueBarChart from "../BarChart";



const TopProductsList = () => {
  const { data, isLoading, isError } = useTopProducts();

  if (isLoading) return <p>Loading revenue data...</p>;
  if (isError) return <p>Failed to fetch revenue data.</p>;


  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Top Products Sold 
          </h2>
          <RevenueBarChart data={data} xdataKey="product__product_name" yDataKey="total_units_sold" tooltipName="Units Sold -" />
        </div>
  );
};

export default TopProductsList;
