import csv
import re
import logging
from datetime import datetime
from django.db import transaction, IntegrityError
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

        for current_row, row in enumerate(csv_reader, start=1):
            # Log the progress
            logger.info(f"Processing row {current_row}/{total_rows}: {row}")

            try:
                # Start a transaction for this individual row to handle errors separately
                with transaction.atomic():
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

            except Exception as e:
                # Log any error that occurs and continue with the next row
                logger.error(f"Error processing row {current_row}: {str(e)}. Skipping this row.")
                continue  # Skip this row and continue with the next row

            # Stop execution after processing 3000 rows
            if current_row >= 3000:
                logger.info("Processed 3000 rows, stopping further execution.")
                break  # Exit the loop after processing 3000 rows

        # Log the successful completion
        logger.info("Finished processing CSV file at %s", datetime.now())

    except Exception as e:
        # Log any errors that occur during the overall process
        logger.error("Error processing file: %s", str(e))
        raise e  # Re-raise the error if needed for further handling



#  Function to extract city and state from the delivery address
def extract_city_state(address):
    # Assuming the format '262 Street, City-62, State-24'
    match = re.match(r".*,\s*(?P<city>[\w\s]+)-\d{1,3},\s*(?P<state>[\w\s]+)-\d{1,3}$", address.strip())
    if match:
        return match.group('city'), match.group('state')
    return None, None  # Return None if no match found

# Function to update city and state for all deliveries
def update_city_state():
    deliveries = Delivery.objects.all()
    updated_count = 0
    
    # Using a transaction to ensure atomicity
    with transaction.atomic():
        for delivery in deliveries:
            if not delivery.city or not delivery.state:  # Only update if empty
                city, state = extract_city_state(delivery.delivery_address)
                if city and state:
                    delivery.city = city
                    delivery.state = state
                    delivery.save()
                    updated_count += 1
    
    return updated_count  # Return number of records updated
