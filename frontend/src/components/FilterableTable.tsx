import React, { useState, useMemo } from "react";
import { useTable, usePagination } from "react-table";
import Select from "react-select";

// Define TypeScript types for the data
interface Product {
  order_id: string;
  product: {
    category: string;
  };
  delivery_status: string;
  platform: string;
  state: string;
  date_of_sale: string;
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

interface FilterableTableProps {
  data: Product[];
}

const FilterableTable: React.FC<FilterableTableProps> = ({ data }) => {
  // State for filters
  const [filters, setFilters] = useState<Filters>({
    category: null,
    deliveryStatus: null,
    platform: null,
    state: null,
    dateRange: { start: "", end: "" },
  });

  const [filteredData, setFilteredData] = useState<Product[]>(data);

  // Handle filter changes
  const handleFilterChange = (name: string, value: string | null) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { ...prev.dateRange, [name]: value },
    }));
  };

  // Apply filters
  const applyFilters = () => {
    const { category, deliveryStatus, platform, state, dateRange } = filters;

    const newFilteredData = data.filter((item) => {
      const matchesCategory =
        !category || item.product.category.toLowerCase() === category.toLowerCase();
      const matchesDeliveryStatus =
        !deliveryStatus || item.delivery_status.toLowerCase() === deliveryStatus.toLowerCase();
      const matchesPlatform =
        !platform || item.platform.toLowerCase() === platform.toLowerCase();
      const matchesState =
        !state || item.state.toString() === state;
      const matchesDateRange =
        (!dateRange.start || new Date(item.date_of_sale) >= new Date(dateRange.start)) &&
        (!dateRange.end || new Date(item.date_of_sale) <= new Date(dateRange.end));

      return (
        matchesCategory &&
        matchesDeliveryStatus &&
        matchesPlatform &&
        matchesState &&
        matchesDateRange
      );
    });

    setFilteredData(newFilteredData);
  };

  // Table columns
  const columns = useMemo(
    () => [
      { Header: "Order ID", accessor: "order_id" },
      { Header: "Product Category", accessor: "product.category" },
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
    state: { pageIndex, pageSize },
    canNextPage,
    canPreviousPage,
    nextPage,
    previousPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageIndex: 0, pageSize: 5 }, // Pagination state
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
              { value: "Electronic", label: "Electronic" },
              { value: "Books", label: "Books" },
              { value: "Fashion", label: "Fashion" },
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
          <Select
            options={[
              { value: "", label: "All" },
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "6", label: "6" },
            ]}
            value={{ value: filters.state, label: filters.state || "All" }}
            onChange={(option) => handleFilterChange("state", option?.value || null)}
            className="block w-full"
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
        onClick={applyFilters}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Apply Filters
      </button>

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          {...getTableProps()}
          className="min-w-full bg-white border border-gray-200 rounded shadow-sm"
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
            {rows.map((row) => {
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
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          className="bg-gray-300 text-gray-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <div>
          Page{" "}
          <strong>
            {pageIndex + 1} of {Math.ceil(filteredData.length / pageSize)}
          </strong>
        </div>
        <button
          onClick={() => nextPage()}
          disabled={!canNextPage}
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
