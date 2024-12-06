import csv
from datetime import datetime
from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from .models import Customer, Product, Order, Delivery, Platform
from .serializers import OrderSerializer, CustomerSerializer, DeliverySerializer, PlatformSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer

class PlatformViewSet(viewsets.ModelViewSet):
    queryset = Platform.objects.all()
    serializer_class = PlatformSerializer

class UploadCSVView(APIView):
    """
    API to upload a CSV file and populate the database.
    """

    def post(self, request):
        csv_file = request.FILES.get('file')

        if not csv_file:
            return Response({"error": "CSV file is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decode the file and parse it
            decoded_file = csv_file.read().decode('utf-8').splitlines()
            csv_reader = csv.DictReader(decoded_file)

            with transaction.atomic():  # Ensures all-or-nothing execution
                for row in csv_reader:
                    # Create or get Customer
                    customer, _ = Customer.objects.get_or_create(
                        customer_id=row['Customer ID'],
                        defaults={
                            'customer_name': row['Customer Name'],
                            'contact_email': row['Contact Email'],
                            'phone_number': row['Phone Number'],
                        }
                    )

                    # Create or get Product
                    product, _ = Product.objects.get_or_create(
                        product_id=row['Product ID'],
                        defaults={
                            'product_name': row['Product Name'],
                            'category': row['Category'],
                            'price': float(row['Selling Price']),
                        }
                    )

                    # Create Order
                    order = Order.objects.create(
                        order_id=row['Order ID'],
                        product=product,
                        customer=customer,
                        quantity_sold=int(row['Quantity Sold']),
                        total_sale_value=float(row['Total Sale Value']),
                        date_of_sale=datetime.strptime(row['Date of Sale'], '%Y-%m-%d').date(),
                    )

                    # Create Delivery
                    Delivery.objects.create(
                        order=order,
                        delivery_address=row['Delivery Address'],
                        delivery_date=datetime.strptime(row['Delivery Date'], '%Y-%m-%d').date(),
                        delivery_status=row['Delivery Status'],
                        delivery_partner=row['Delivery Partner'],
                    )

                    # Create Platform
                    Platform.objects.create(
                        order=order,
                        platform_name=row['Platform'],
                        seller_id=row['Seller ID'],
                    )

            return Response({"message": "Data successfully imported!"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
