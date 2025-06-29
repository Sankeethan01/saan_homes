# Equipment API Integration

## Overview
The equipment rental page now fetches real data from the Django backend API. This allows public users to browse equipment without authentication, and only requires login when booking equipment.

## API Endpoints Used

### Public Access (No Authentication Required)
- `GET /api/equipments/equipment/` - List all equipment
- `GET /api/equipments/equipment/{id}/` - Get equipment details
- `GET /api/equipments/categories/` - List equipment categories

### Authenticated Access (Login Required)
- `POST /api/equipments/bookings/` - Create equipment booking

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 2. Start Backend Server
```bash
cd server
python manage.py runserver
```

### 3. Start Frontend Server
```bash
cd client
npm run dev
```

## Features Implemented

### ✅ Public Equipment Browsing
- Equipment listing with real data from backend
- Category filtering with dynamic counts
- Search functionality
- Equipment details display
- No authentication required

### ✅ Dynamic Filtering
- Categories fetched from backend
- Real-time search
- Equipment count per category
- Interactive category selection

### ✅ Rich Equipment Display
- Equipment images with fallback
- Pricing with discount indicators
- Technical specifications
- Availability status
- Location information
- Featured equipment highlighting

### ✅ User Experience
- Loading states with skeletons
- Error handling with retry
- Empty state messages
- Responsive design
- Smooth animations

## User Flow
1. **Public Access**: Users can browse equipment without login
2. **Equipment Details**: Click on equipment to view details (no auth required)
3. **Booking**: Click "Book Now" → Redirects to login
4. **After Login**: Returns to same equipment page for booking

## Navigation
- **Person Icon**: Redirects to login page
- **After Login**: Person icon becomes profile dropdown with:
  - Dashboard (goes to `/dashboard/me`)
  - Logout option

## Testing
1. Visit `http://localhost:3000/equipments`
2. Verify equipment loads without login
3. Test search and category filtering
4. Click on equipment to view details
5. Verify "Book Now" redirects to login

## Troubleshooting

### No Equipment Showing
- Check if Django server is running on port 8000
- Verify API endpoint: `http://localhost:8000/api/equipments/equipment/`
- Check browser console for errors

### Images Not Loading
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Check Django media files configuration
- Fallback image should show if backend images fail

### Categories Not Loading
- Check categories endpoint: `http://localhost:8000/api/equipments/categories/`
- Verify CategoryViewSet permissions allow public read access 