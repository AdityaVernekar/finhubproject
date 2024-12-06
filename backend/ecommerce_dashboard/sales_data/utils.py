import csv
import logging
from datetime import datetime
from django.db import transaction
from .models import Customer, Product, Order, Delivery, Platform

# Set up logging
logger = logging.getLogger(__name__)

def process_csv_file(csv_file):
    """
    Processes a CSV file, performs database operations, and logs the process.
    
    Args:
        csv_file: The CSV file to be processed.
    """

    # Log the start time
    logger.info("Started processing CSV file at %s", datetime.now())

    try:
        # Decode the file and parse it
        decoded_file = csv_file.read().decode('utf-8').splitlines()
        csv_reader = csv.DictReader(decoded_file)
        total_rows = sum(1 for row in decoded_file) - 1  # Subtract 1 for header row

        # Start a transaction to ensure all-or-nothing execution
        with transaction.atomic():
            for current_row, row in enumerate(csv_reader, start=1):
                # Log the progress
                logger.info(f"Processing row {current_row}/{total_rows}: {row}")

                # Create or get Customer
                customer, _ = Customer.objects.get_or_create(
                    customer_id=row['CustomerID'],
                    defaults={
                        'customer_name': row['CustomerName'],
                        'contact_email': row['ContactEmail'],
                        'phone_number': row['PhoneNumber'],
                    }
                )

                # Create or get Product
                product, _ = Product.objects.get_or_create(
                    product_id=row['ProductID'],
                    defaults={
                        'product_name': row['ProductName'],
                        'category': row['Category'],
                        'price': float(row['SellingPrice']),
                    }
                )

                # Create Order
                order = Order.objects.create(
                    order_id=row['OrderID'],
                    product=product,
                    customer=customer,
                    quantity_sold=int(row['QuantitySold']),
                    total_sale_value=float(row['SellingPrice']) * int(row['QuantitySold']),
                    date_of_sale=datetime.strptime(row['DateOfSale'], '%Y-%m-%d').date(),
                )

                # Create Delivery
                Delivery.objects.create(
                    order=order,
                    delivery_address=row['DeliveryAddress'],
                    delivery_date=datetime.strptime(row['DeliveryDate'], '%Y-%m-%d').date(),
                    delivery_status=row['DeliveryStatus']
                )

                # Create Platform
                Platform.objects.create(
                    order=order,
                    platform_name=row['Platform'],
                )

                # Stop execution after processing 10 rows
                if current_row >= 10:
                    logger.info("Processed 10 rows, stopping further execution.")
                    break  # Exit the loop after processing 10 rows

        # Log the successful completion
        logger.info("Finished processing CSV file at %s", datetime.now())

    except Exception as e:
        # Log any errors that occur
        logger.error("Error processing file: %s", str(e))
        raise e  # Re-raise the error if needed for further handling
