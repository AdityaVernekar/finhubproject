import React, { useState, useEffect, useMemo } from "react";
import { useTable, usePagination } from "react-table";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getTabularData } from "../api/dashboard";

// Helper function to get the start and end dates of the current month
const getCurrentMonthDates = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};

// Define TypeScript types for the data
interface Product {
  order_id: string;
  product: string;
  delivery_status: string;
  platform: string;
  state: string;
  date_of_sale: string;
  quantity_sold: number;
  total_sale_value: number;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
}

interface Filters {
  category: string | null;
  deliveryStatus: string | null;
  platform: string | null;
  state: string | null;
  dateRange: {
    start: string;
    end: string;
  };
}

const FilterableTable: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    category: searchParams.get("category"),
    deliveryStatus: searchParams.get("deliveryStatus"),
    platform: searchParams.get("platform"),
    state: searchParams.get("state"),
    dateRange: {
      start: searchParams.get("start_date") || getCurrentMonthDates().start,
      end: searchParams.get("end_date") || getCurrentMonthDates().end,
    }
  });

  // State for the finalized filters to be applied
  const [appliedFilters, setAppliedFilters] = useState<Filters>(filters);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch data using React Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["filterabledata", appliedFilters, page, pageSize],
    queryFn: async () => {
      const res = await getTabularData(
        appliedFilters.dateRange.start,
        appliedFilters.dateRange.end,
        appliedFilters.category || "",
        appliedFilters.deliveryStatus || "",
        appliedFilters.platform || "",
        appliedFilters.state || "",
        page,
        pageSize
      );
      return res;
    },
    keepPreviousData: true, // Optional: Keeps previous data while loading new data
    enabled: false, // Disable automatic fetching on mount
  });

   // Update URL whenever filters or pagination changes
   useEffect(() => {
    const params: Record<string, string> = {};
  
    // Add non-null filters to the query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "dateRange") {
        params["start_date"] = value.start;
        params["end_date"] = value.end;
      } else if (value) {
        params[key] = value;
      }
    });
  
    // Add pagination details
    params.page = page.toString();
    params.pageSize = pageSize.toString();
  
    setSearchParams(params);
  }, [filters, page, pageSize, setSearchParams]);
  
  // Handle filter changes (update UI state)
  const handleFilterChange = (name: string, value: string | null) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { ...prev.dateRange, [name]: value },
    }));
  };

  // Apply filters and refetch data
  const handleApplyFilters = () => {
    setAppliedFilters(filters); // Save the current filters as applied filters
    setPage(1); // Reset to the first page on filter change
  };

  // Refetch data whenever appliedFilters or page changes
  useEffect(() => {
    refetch();
  }, [appliedFilters, page, pageSize, refetch]);

  // Table columns
  const columns = useMemo(
    () => [
      { Header: "Order ID", accessor: "order_id" },
      { Header: "Product", accessor: "product" },
      { Header: "Quantity Sold", accessor: "quantity_sold" },
      { Header: "Total Sale Value", accessor: "total_sale_value" },
      { Header: "Delivery Status", accessor: "delivery_status" },
      { Header: "Platform", accessor: "platform" },
      { Header: "State", accessor: "state" },
      { Header: "Date of Sale", accessor: "date_of_sale" },
    ],
    []
  );

  // Table instance using useTable and usePagination
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    canNextPage,
    canPreviousPage,
    nextPage,
    previousPage,
  } = useTable(
    {
      columns,
      data: data?.data || [],
      manualPagination: true,
      pageCount: data?.pagination?.total_pages || 0,
    },
    usePagination
  );


  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Filterable Sales Table</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
          <Select
            options={[
              { value: "", label: "All" },
              { value: "Laptop", label: "Laptop" },
              { value: "Shoes", label: "Shoes" },
              { value: "Book", label: "Book" },
            ]}
            value={{ value: filters.category, label: filters.category || "All" }}
            onChange={(option) => handleFilterChange("category", option?.value || null)}
            className="block w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Status</label>
          <Select
            options={[
              { value: "", label: "All" },
              { value: "Delivered", label: "Delivered" },
              { value: "In Transit", label: "In Transit" },
              { value: "Cancelled", label: "Cancelled" },
            ]}
            value={{ value: filters.deliveryStatus, label: filters.deliveryStatus || "All" }}
            onChange={(option) => handleFilterChange("deliveryStatus", option?.value || null)}
            className="block w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <Select
            options={[
              { value: "", label: "All" },
              { value: "Amazon", label: "Amazon" },
              { value: "Flipkart", label: "Flipkart" },
              { value: "Meesho", label: "Meesho" },
            ]}
            value={{ value: filters.platform, label: filters.platform || "All" }}
            onChange={(option) => handleFilterChange("platform", option?.value || null)}
            className="block w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={filters.state || ""}
            onChange={(e) => handleFilterChange("state", e.target.value || null)}
            className="block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <div className="flex space-x-2">
            <input
              type="date"
              name="start"
              value={filters.dateRange.start}
              onChange={(e) => handleDateChange("start", e.target.value)}
              className="block w-1/2 p-2 border border-gray-300 rounded"
            />
            <input
              type="date"
              name="end"
              value={filters.dateRange.end}
              onChange={(e) => handleDateChange("end", e.target.value)}
              className="block w-1/2 p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Apply Filters Button */}
      <button
        onClick={handleApplyFilters}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Apply Filters
      </button>

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          {...getTableProps()}
          className="min-w-full min-h-[70vh] bg-white border border-gray-200 rounded shadow-sm"
        >
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    className="text-left px-4 py-2 border-b"
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="text-sm text-gray-700">
            {!isLoading && rows?.length === 0 && (
               <tr>
               <td colSpan={columns.length} className="text-center py-4">
                 No Items Found
               </td>
             </tr>
            )}
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="border-b hover:bg-gray-50">
                    {row.cells.map((cell) => (
                      <td
                        {...cell.getCellProps()}
                        className="px-4 py-2 border-b"
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => {
            previousPage();
            setPage((prev) => prev - 1);
          }}
          disabled={!canPreviousPage || page === 1}
          className="bg-gray-300 text-gray-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <div>
          Page{" "}
          <strong>
            {page} of {data?.pagination?.total_pages || 1}
          </strong>
        </div>
        <button
          onClick={() => {
            nextPage();
            setPage((prev) => prev + 1);
          }}
          disabled={!canNextPage || page === (data?.pagination?.total_pages || 1)}
          className="bg-gray-300 text-gray-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="border border-gray-300 rounded p-2"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterableTable;
