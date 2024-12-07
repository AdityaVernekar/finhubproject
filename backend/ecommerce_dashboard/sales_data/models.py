from django.db import models

# Product Details Model
class Product(models.Model):
    product_id = models.CharField(max_length=100, unique=True)
    product_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        indexes = [
            models.Index(fields=['product_id']),  # Adds an index to product_id
            models.Index(fields=['category']),  # Adds an index to category
        ]

    def __str__(self):
        return self.product_name

# Customer Details Model
class Customer(models.Model):
    customer_id = models.CharField(max_length=100, unique=True)
    customer_name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    phone_number = models.CharField(max_length=15)
    class Meta:
        indexes = [
            models.Index(fields=['customer_id']),  # Adds an index to customer_id
            models.Index(fields=['contact_email']),  # Adds an index to contact_email
        ]

    def __str__(self):
        return self.customer_name

# Order Details Model
class Order(models.Model):
    order_id = models.CharField(max_length=100, unique=True)
    customer = models.ForeignKey(
        'Customer', related_name='orders', on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        'Product', related_name='orders', on_delete=models.CASCADE
    )
    quantity_sold = models.IntegerField()
    total_sale_value = models.DecimalField(max_digits=12, decimal_places=2)
    date_of_sale = models.DateField()
    
    
    class Meta:
        indexes = [
            models.Index(fields=['date_of_sale']),  # Adds an index to date_of_sale
            models.Index(fields=['date_of_sale', 'quantity_sold']), #Composite index for filtering + aggregation
        ]


    def __str__(self):
        return f"Order {self.order_id} by {self.customer.customer_name}"

# Delivery Details Model
class Delivery(models.Model):
    order = models.ForeignKey(Order, related_name='deliveries', on_delete=models.CASCADE)
    delivery_address = models.TextField()
    delivery_date = models.DateField()
    delivery_status = models.CharField(max_length=50, choices=[('Delivered', 'Delivered'), ('In Transit', 'In Transit'), ('Canceled', 'Canceled')])
      # New fields for city and state (optional)
    # city = models.CharField(max_length=100, blank=True, null=True)
    # state = models.CharField(max_length=100, blank=True, null=True)
    def __str__(self):
        return f"Delivery for Order {self.order.order_id}"

# Platform Details Model
class Platform(models.Model):
    order = models.ForeignKey(Order, related_name='platforms', on_delete=models.CASCADE)
    platform_name = models.CharField(max_length=100, choices=[('Flipkart', 'Flipkart'), ('Amazon', 'Amazon'), ('Meesho', 'Meesho')])

    def __str__(self):
        return self.platform_name
