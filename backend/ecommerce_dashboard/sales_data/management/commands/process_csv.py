from django.core.management.base import BaseCommand
from sales_data.utils import process_csv_file
import os

class Command(BaseCommand):
    help = 'Process a CSV file and update the database'

    def add_arguments(self, parser):
        # Argument to accept the file name (e.g., 'amazon.csv')
        parser.add_argument('csv_filename', type=str, help='Name of the CSV file to process')

    def handle(self, *args, **kwargs):
        csv_filename = kwargs['csv_filename']
        
        # Construct the full path to the CSV file
        file_path = os.path.join('sales_data', 'management', 'csv_files', csv_filename)

        if os.path.exists(file_path):
            try:
                with open(file_path, 'rb') as f:
                    process_csv_file(f)  # Pass the file to the processing function
                self.stdout.write(self.style.SUCCESS(f'Successfully processed {csv_filename}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error processing file: {e}"))
        else:
            self.stdout.write(self.style.ERROR(f"File {csv_filename} not found in 'csv_files' folder"))
