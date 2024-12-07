import React, { useMemo } from "react";
import {
  FaRupeeSign,
  FaBox,
  FaShoppingCart,
  FaTimesCircle,
  FaChartLine,
  FaStar,
  FaUserFriends,
} from "react-icons/fa";
import CountUp from "react-countup";
import { useQuery } from "@tanstack/react-query";
import { getSummaryMetrics } from "../api/dashboard";

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  description: string;
  disableLine?: boolean;
}

const Card: React.FC<CardProps> = ({
  icon,
  title,
  value,
  description,
  disableLine,
}) => {
  return (
    <div className="flex justify-center items-center w-full gap-10 hover:bg-gray-50 transition-all ease-in-out duration-300 hover:shadow-lg">
      <div className="text-gray-800 w-full py-6 px-4 flex flex-col items-start rounded-lg">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col items-start">
            <p className="text-2xl font-bold">
              {typeof value === "number" ? <CountUp end={value} duration={2} separator="," />:value}
            </p>
            <h4 className="text-md font-medium mb-2">{title}</h4>
          </div>
          {icon}
        </div>
        <p className="text-sm text-[#7C8DB5] mt-1">{description}</p>
      </div>
      {!disableLine && (
        <hr className="border-[0.5px] border-[#E6EDFF] h-[90%] my-auto py-2" />
      )}
    </div>
  );
};

interface Metrics {
  total_revenue: number;
  total_orders: number;
  total_products_sold: number;
  canceled_order_percentage: number;
  average_order_value: number;
  top_selling_product: string;
  delivery_success_rate: number;
  total_unique_customers: number;
}

const SummaryMetrics: React.FC = () => {
  const metricDescriptions = {
    total_revenue: "Total earnings from sales",
    total_orders: "Orders placed by customers",
    total_products_sold: "Units sold across all products",
    canceled_order_percentage: "Percentage of orders not fulfilled",
    average_order_value: "Average revenue per order",
    top_selling_product: "Product with the highest sales",
    delivery_success_rate: "Percentage of successful deliveries",
    total_unique_customers: "Unique customers who placed orders",
  };

  const { data } = useQuery({
    queryKey: ["summary"],
    queryFn: async () => {
      const response = await getSummaryMetrics("2024-01-01", "2024-12-31");
      return response.data as Metrics;
    },
  });

  const metricsData = useMemo(() => {
    return [
      {
        id: "total_revenue",
        icon: <FaRupeeSign className="text-2xl text-[#0F123F]" />,
        title: "Total Revenue",
        value: data?.total_revenue,
        description: metricDescriptions.total_revenue,
      },
      {
        id: "total_orders",
        icon: <FaShoppingCart className="text-2xl text-[#0F123F]" />,
        title: "Total Orders",
        value: data?.total_orders,
        description: metricDescriptions.total_orders,
      },
      {
        id: "total_products_sold",
        icon: <FaBox className="text-2xl text-[#0F123F]" />,
        title: "Total Products Sold",
        value: data?.total_products_sold,
        description: metricDescriptions.total_products_sold,
      },
      {
        id: "canceled_order_percentage",
        icon: <FaTimesCircle className="text-2xl text-[#0F123F]" />,
        title: "Cancelled Orders",
        value: data?.canceled_order_percentage,
        description: metricDescriptions.canceled_order_percentage,
      },
      {
        id: "average_order_value",
        icon: <FaChartLine className="text-2xl text-[#0F123F]" />,
        title: "Average Order Value",
        value: data?.average_order_value,
        description: metricDescriptions.average_order_value,
      },
      {
        id: "top_selling_product",
        icon: <FaStar className="text-2xl text-[#0F123F]" />,
        title: "Top Selling Product",
        value: data?.top_selling_product || "N/A",
        description: metricDescriptions.top_selling_product,
      },
      {
        id: "delivery_success_rate",
        icon: <FaChartLine className="text-2xl text-[#0F123F]" />,
        title: "Delivery Success Rate",
        value: data?.delivery_success_rate,
        description: metricDescriptions.delivery_success_rate,
      },
      {
        id: "total_unique_customers",
        icon: <FaUserFriends className="text-2xl text-[#0F123F]" />,
        title: "Unique Customers",
        value: data?.total_unique_customers,
        description: metricDescriptions.total_unique_customers,
      },
    ];
  }, [data]);

  return (
    <div className="px-10 py-2 bg-white rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-[#E6EDFF] rounded-lg">
        {metricsData.map((metric) => (
          <Card
            key={metric.id}
            icon={metric.icon}
            title={metric.title}
            value={metric.value ?? 0}
            description={metric.description}
            disableLine={metric.id === "total_unique_customers"}
          />
        ))}
      </div>
    </div>
  );
};

export default SummaryMetrics;
