from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Add missing columns to projects_invoice table'

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            # Add missing columns if they don't exist
            sql = """
            DO $$ 
            BEGIN
                -- Check and add date column
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects_invoice' AND column_name = 'date') THEN
                    ALTER TABLE projects_invoice ADD COLUMN date DATE;
                END IF;
                
                -- Check and add vendor column
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects_invoice' AND column_name = 'vendor') THEN
                    ALTER TABLE projects_invoice ADD COLUMN vendor VARCHAR(255);
                END IF;
                
                -- Check and add client column
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects_invoice' AND column_name = 'client') THEN
                    ALTER TABLE projects_invoice ADD COLUMN client VARCHAR(255);
                END IF;
                
                -- Check and add subtotal column
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects_invoice' AND column_name = 'subtotal') THEN
                    ALTER TABLE projects_invoice ADD COLUMN subtotal DECIMAL(12,2);
                END IF;
                
                -- Check and add tax column
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects_invoice' AND column_name = 'tax') THEN
                    ALTER TABLE projects_invoice ADD COLUMN tax DECIMAL(12,2);
                END IF;
                
                -- Check and add total column
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects_invoice' AND column_name = 'total') THEN
                    ALTER TABLE projects_invoice ADD COLUMN total DECIMAL(12,2);
                END IF;
                
                -- Check and add ocr_confidence column
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects_invoice' AND column_name = 'ocr_confidence') THEN
                    ALTER TABLE projects_invoice ADD COLUMN ocr_confidence FLOAT;
                END IF;
                
                -- Check and add ocr_text column
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects_invoice' AND column_name = 'ocr_text') THEN
                    ALTER TABLE projects_invoice ADD COLUMN ocr_text TEXT;
                END IF;

            END $$;
            """
            cursor.execute(sql)
            self.stdout.write(self.style.SUCCESS('Successfully added missing columns'))