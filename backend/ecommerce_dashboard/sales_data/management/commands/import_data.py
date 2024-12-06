import csv
from datetime import datetime
from django.db import transaction
# from ecommerce_dashboard.models import Customer, Product, Order, Delivery, Platform

# Function to populate data
def populate_data(file_path, platform_name):
    # Step 1: Read CSV File
    with open(file_path, 'r') as file:
        reader = csv.DictReader(file)
        data = [row for row in reader]

    # Uncomment the next line to view the data in the console before populating
    print(data)

    # Step 2: Populate Tables
    # with transaction.atomic():  # Ensures atomicity in case of errors
    #     for row in data:
    #         # Populate Customer Table
    #         customer, _ = Customer.objects.get_or_create(
    #             customer_id=row['customer_id'],
    #             defaults={
    #                 'customer_name': row['customer_name'],
    #                 'contact_email': row['contact_email'],
    #                 'phone_number': row['phone_number']
    #             }
    #         )

    #         # Populate Product Table
    #         product, _ = Product.objects.get_or_create(
    #             product_id=row['product_id'],
    #             defaults={
    #                 'product_name': row['product_name'],
    #                 'category': row['category'],
    #                 'price': float(row['price'])
    #             }
    #         )

    #         # Populate Order Table
    #         order, _ = Order.objects.get_or_create(
    #             order_id=row['order_id'],
    #             defaults={
    #                 'customer': customer,
    #                 'product': product,
    #                 'quantity_sold': int(row['quantity_sold']),
    #                 'total_sale_value': float(row['total_sale_value']),
    #                 'date_of_sale': datetime.strptime(row['date_of_sale'], '%Y-%m-%d').date()
    #             }
    #         )

    #         # Populate Delivery Table
    #         Delivery.objects.get_or_create(
    #             order=order,
    #             defaults={
    #                 'delivery_address': row['delivery_address'],
    #                 'delivery_date': datetime.strptime(row['delivery_date'], '%Y-%m-%d').date(),
    #                 'delivery_status': row['delivery_status'],
    #                 'delivery_partner': row['delivery_partner']
    #             }
    #         )

    #         # Populate Platform Table
    #         Platform.objects.get_or_create(
    #             order=order,
    #             defaults={
    #                 'platform_name': platform_name,
    #                 'seller_id': row['seller_id']
    #             }
    #         )

    print(f"Data from {file_path} for platform {platform_name} has been populated successfully!")

# Example Usage
if __name__ == "__main__":
    # Add paths to your CSV files and their corresponding platforms
    csv_files = [
        {"file_path": "flipkart.csv", "platform_name": "Flipkart"},
        # {"file_path": "amazon.csv", "platform_name": "Amazon"},
        # {"file_path": "myntra.csv", "platform_name": "Myntra"}
    ]

    for file_info in csv_files:
        populate_data(file_info['file_path'], file_info['platform_name'])
