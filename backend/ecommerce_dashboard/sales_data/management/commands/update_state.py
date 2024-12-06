
from django.core.management.base import BaseCommand
from sales_data.utils import update_city_state

class Command(BaseCommand):
    help = 'Updates city and state for all deliveries based on delivery address'

    def handle(self, *args, **kwargs):
        updated_count = update_city_state()
        self.stdout.write(self.style.SUCCESS(f"Successfully updated {updated_count} deliveries"))
