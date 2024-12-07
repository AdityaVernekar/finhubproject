import { useQuery } from "@tanstack/react-query";
import { getMonthlyRevenue, getMonthlySalesVolume, getOrderSalesByPlatform, getTopProducts } from "../api/dashboard";
import { getMonthName } from "../utils";

export const useRevenueData = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["monthly_revenue"],
    queryFn: async () => {
      const res = await getMonthlyRevenue("2024-01-01", "2024-12-31");
      return res?.data || [];
    },
  });

  // Process/format the data if available
  const formattedData = data?.map((item) => ({
    month: getMonthName(item.month),
    revenue: parseFloat(item.total_revenue),
  })) || [];

  return { data:formattedData, isLoading, isError };
};



export const useSalesData = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["monthly_sales"],
    queryFn: async () => {
      const res = await getMonthlySalesVolume("2024-01-01", "2024-12-31");
      return res?.data || [];
    },
  });

  // Format the data
  const formattedData = data?.map((item) => ({
    month: getMonthName(item.month),
    quantity: item.quantity_sold,
  })) || [];

  return { data:formattedData, isLoading, isError };
};



export const useTopProducts = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["OrderSalesChart"],
    queryFn: async () => {
      const res = await getTopProducts()
      return res?.data || [];
    },
  });



  return { data, isLoading, isError };
};




export const useOrderSalesByPlatformandMonth = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orderbyplatform"],
    queryFn: async () => {
      const res = await getOrderSalesByPlatform()
      return res?.data || [];
    },
  });

  return { data, isLoading, isError };
};