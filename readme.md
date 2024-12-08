# Sales Data Dashboard - Fihub

This project is a web application designed to provide insights into sales data using an interactive dashboard. It features backend APIs built with Django and Django REST Framework, a React.js frontend, and PostgreSQL for data storage. The application is hosted on AWS.

---

## **Features**

### **Backend**
- **APIs for Data Management and Analytics**:
  - **Importing CSV Data**:
    Command-line function to parse and process CSV files into the database.  
    Example:  
    ```bash
    python manage.py process_csv amazon.csv
    ```
  - **Filtered Data API**:  
    Fetches filtered sales data for the dashboard. Supports filters like date range, product category, platform, and more.  
    Example Request:  
    ```bash
    curl 'http://13.60.228.38:8000/api/table/?start_date=2023-05-31&end_date=2024-12-30&page=1&limit=10'
    ```
  - **Summary Metrics API**:  
    Serves metrics for summary sections including:
    - Total Revenue
    - Total Orders
    - Total Products Sold
    - Canceled Order Percentage
    - Average Order Value
    - Top Selling Product
    - Delivery Success Rate
    - Total Unique Customers  
    Example Request:  
    ```bash
    curl 'http://13.60.228.38:8000/api/summary/?start_date=2024-01-01&end_date=2024-12-31'
    ```
  - **Trend Analysis API**:
    Provides normalized sales percentage trends by platform over time and top products sold.

- **Database**:  
  - PostgreSQL database for structured storage and querying.
  - Django Cache for Performance Optimization

---

### **Frontend**
- **Summary Metrics Section**:
  - Displays key performance indicators (KPIs) including:
    - Total Revenue
    - Total Orders
    - Total Products Sold
    - Canceled Order Percentage
    - Additional Metrics:
      - Average Order Value
      - Top Selling Product
      - Delivery Success Rate
      - Total Unique Customers  


- **Graphs**:
  - **Line Chart**:
    - Monthly sales volume (Quantity Sold)
    - Normalized sales percentage trends by platform over time
  - **Bar Chart**:
    - Monthly revenue (Total Sale Value)
    - Top Products Sold

- **Filterable Data Table**:
  - **Filters**:
    - Date Range (Sales Date)
    - Product Category
    - Delivery Status
    - Platform
    - State
  - **Features**:
    - Pagination for large datasets
    - Download data as CSV

---

### **Hosting**
- The application is hosted on AWS.  
  **Frontend URL**: [http://13.60.228.38:4173/](http://13.60.228.38:4173/)

---

## **Setup Instructions**

### **Backend Setup**
1. Clone the repository.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Apply database migrations:
   ```bash
   python manage.py migrate
   ```
4. Start the development server:
   ```bash
   python manage.py runserver
   ```

### **Frontend Setup**
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

---

## **How to Use**
1. Import sales data by running the CSV processing command:
   ```bash
   python manage.py process_csv <filename>
   ```
2. Access the dashboard at [http://13.60.228.38:4173/](http://13.60.228.38:4173/).
3. Use filters to refine the data displayed in the table and graphs.
4. Download filtered data as CSV for offline analysis.

---

## **API Endpoints**
### **Filtered Data Table**
- URL: `/api/table/`
- Example Request:
  ```bash
  curl 'http://13.60.228.38:8000/api/table/?start_date=2023-05-31&end_date=2024-12-30&page=1&limit=10'
  ```
  
### **Summary Metrics**
- URL: `/api/summary/`
- Example Request:
  ```bash
  curl 'http://13.60.228.38:8000/api/summary/?start_date=2024-01-01&end_date=2024-12-31'
  ```

---

## **Technologies Used**
- **Backend**:
  - Django
  - Django REST Framework
- **Frontend**:
  - React.js
- **Database**:
  - PostgreSQL
- **Hosting**:
  - AWS

---

