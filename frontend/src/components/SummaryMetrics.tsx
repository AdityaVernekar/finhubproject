import React from "react";
import {
  FaDollarSign,
  FaBox,
  FaShoppingCart,
  FaTimesCircle,
} from "react-icons/fa";
import CountUp from 'react-countup';


interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
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
      <div className=" text-gray-800 w-full py-6 px-4 flex flex-col items-start rounded-lg">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col items-start">
            <p className="text-2xl font-bold">
              <CountUp end={value} duration={2} separator="," />
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
}

interface SummaryMetricsProps {
  metrics: Metrics;
}

const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ metrics }) => {
  const metricDescriptions = {
    total_revenue: "Total earnings from sales",
    total_orders: "Orders placed by customers",
    total_products_sold: "Units sold across all products",
    canceled_order_percentage: "Orders not fulfilled",
  };

  const metricsData = [
    {
      id: "total_revenue",
      icon: <FaDollarSign className="text-2xl text-[#0F123F]" />,
      title: "Total Revenue",
      value: metrics.total_revenue,
      description: metricDescriptions.total_revenue,
      disableLine: false,
    },
    {
      id: "total_orders",
      icon: <FaShoppingCart className="text-2xl text-[#0F123F]" />,
      title: "Total Orders",
      value: metrics.total_orders,
      description: metricDescriptions.total_orders,
      disableLine: false,
    },
    {
      id: "total_products_sold",
      icon: <FaBox className="text-2xl text-[#0F123F]" />,
      title: "Total Products Sold",
      value: metrics.total_products_sold,
      description: metricDescriptions.total_products_sold,
      disableLine: false,
    },
    {
      id: "canceled_order_percentage",
      icon: <FaTimesCircle className="text-2xl text-[#0F123F]" />,
      title: "Canceled Orders",
      value: metrics.canceled_order_percentage,
      description: metricDescriptions.canceled_order_percentage,
      disableLine: true,
    },
  ];

  return (
    <div className="px-10 py-2 bg-white rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  border border-[#E6EDFF] rounded-lg">
        {metricsData.map((metric) => (
          <Card
            key={metric.id}
            icon={metric.icon}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            disableLine={metric.disableLine}
          />
        ))}
      </div>
    </div>
  );
};

export default SummaryMetrics;
