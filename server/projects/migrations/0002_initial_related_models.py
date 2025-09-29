from django.db import migrations, models
import uuid
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='supervisor',
            field=models.ForeignKey(null=True, on_delete=models.SET_NULL, related_name='projects', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='Step',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('order', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('project', models.ForeignKey(on_delete=models.CASCADE, related_name='steps', to='projects.project')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='Bill',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('pdf', models.FileField(upload_to='bills/')),
                ('ocr_data', models.JSONField(default=dict)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('verified', models.BooleanField(default=False)),
                ('step', models.ForeignKey(on_delete=models.CASCADE, related_name='bills', to='projects.step')),
                ('uploaded_by', models.ForeignKey(on_delete=models.CASCADE, related_name='uploaded_bills', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('data', models.JSONField(default=dict)),
                ('is_approved', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('sent_to_admin_at', models.DateTimeField(null=True, blank=True)),
                ('approved_by_admin_at', models.DateTimeField(null=True, blank=True)),
                ('status', models.CharField(choices=[('PROCESSING', 'Processing'), ('EDITING', 'Editing'), ('VERIFIED', 'Verified'), ('SENT', 'Sent to Admin'), ('APPROVED', 'Approved by Admin'), ('REJECTED', 'Rejected by Admin')], default='PROCESSING', max_length=20)),
                ('date', models.DateField(null=True, blank=True)),
                ('vendor', models.CharField(max_length=255, null=True, blank=True)),
                ('client', models.CharField(max_length=255, null=True, blank=True)),
                ('subtotal', models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)),
                ('tax', models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)),
                ('total', models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)),
                ('ocr_confidence', models.FloatField(null=True, blank=True)),
                ('ocr_text', models.TextField(null=True, blank=True)),
                ('invoice_number', models.CharField(max_length=100, null=True, blank=True)),
                ('bill', models.ForeignKey(on_delete=models.CASCADE, related_name='invoices', to='projects.bill')),
                ('project', models.ForeignKey(on_delete=models.CASCADE, related_name='invoices', to='projects.project')),
                ('step', models.ForeignKey(on_delete=models.CASCADE, related_name='invoices', to='projects.step')),
                ('created_by', models.ForeignKey(on_delete=models.CASCADE, related_name='created_invoices', to=settings.AUTH_USER_MODEL)),
                ('approved_by', models.ForeignKey(null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_invoices', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]