import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
  Rating,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Stack
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api, { BACKEND_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const VendorDetails = () => {
  const { id } = useParams();
  const decodedId = decodeURIComponent(id);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Enhanced booking state
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);
  const [bookingLocation, setBookingLocation] = useState('');
  const [attendeesCount, setAttendeesCount] = useState('');
  const [eventType, setEventType] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [openBooking, setOpenBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Add image dialog state
  const [openImageDialog, setOpenImageDialog] = useState(false);

  // Fetch vendor details
  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ['vendor', decodedId],
    queryFn: async () => {
      const response = await api.get(`/vendors/${decodedId}`);
      return response.data;
    }
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      try {
        // Call the API to create a booking
        const response = await api.post('/bookings', bookingData);
        return response.data;
      } catch (error) {
        console.error('Error creating booking:', error);
        throw error; // Re-throw the error to be handled by the onError callback
      }
    },
    onSuccess: (data) => {
      // Show success message
      setSnackbar({
        open: true,
        message: 'Booking created successfully!',
        severity: 'success'
      });
      
      // Navigate to booking confirmation page
      navigate(`/booking-confirmation/${data._id}`);
    },
    onError: (error) => {
      // Show error message
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create booking. Please try again.',
        severity: 'error'
      });
    }
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleBookNow = (product) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/vendors/${id}` } });
      return;
    }
    setSelectedProduct(product);
    resetBookingForm();
    setOpenBooking(true);
  };

  const resetBookingForm = () => {
    setBookingDate(null);
    setBookingTime(null);
    setBookingLocation('');
    setAttendeesCount('');
    setEventType('');
    setBookingNotes('');
    setContactPhone('');
    setFormErrors({});
    setBookingError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!bookingDate) errors.date = 'Date is required';
    if (!bookingTime) errors.time = 'Time is required';
    if (!bookingLocation) errors.location = 'Location is required';
    if (!attendeesCount) errors.attendees = 'Number of attendees is required';
    if (!eventType) errors.eventType = 'Event type is required';
    if (!contactPhone) errors.phone = 'Contact phone is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = () => {
    if (!validateForm()) return;

    // Combine date and time
    const bookingDateTime = new Date(bookingDate);
    if (bookingTime) {
      const timeDate = new Date(bookingTime);
      bookingDateTime.setHours(timeDate.getHours());
      bookingDateTime.setMinutes(timeDate.getMinutes());
    }

    // Format time as string (HH:MM)
    const formattedTime = bookingTime 
      ? `${bookingTime.getHours().toString().padStart(2, '0')}:${bookingTime.getMinutes().toString().padStart(2, '0')}`
      : bookingDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create booking data with proper field names
    const bookingData = {
      productId: selectedProduct._id,
      vendorId: vendor._id,
      date: bookingDateTime.toISOString(), // Format date as ISO string
      time: formattedTime,
      eventType: eventType || "Other",
      guestCount: parseInt(attendeesCount) || 1,
      specialRequests: bookingNotes || '',
      amount: selectedProduct.price || 0
    };
    
    console.log('Submitting booking data:', bookingData);
    
    createBookingMutation.mutate(bookingData);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenImageDialog(true);
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
    setSelectedImage(null);
  };

  // Function to get complete image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) {
      return `${import.meta.env.VITE_API_URL}${imageUrl}`;
    }
    return null;
  };

  // Function to get image URL from product image
  const getProductImageUrl = (image) => {
    if (!image) return null;
    if (typeof image === 'string') return getImageUrl(image);
    return getImageUrl(image.url);
  };

  // Function to get all images from vendor and products
  const getAllImages = () => {
    const images = [];
    
    // Add vendor images
    if (vendor.images && Array.isArray(vendor.images)) {
      images.push(...vendor.images.map(img => getImageUrl(img)).filter(Boolean));
    }

    // Add product images
    if (vendor.products && Array.isArray(vendor.products)) {
      vendor.products.forEach(product => {
        if (product.images && Array.isArray(product.images)) {
          images.push(...product.images.map(img => getProductImageUrl(img)).filter(Boolean));
        }
      });
    }

    return images.filter(Boolean); // Remove any null/undefined values
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Error loading vendor details: {error.message}</Alert>
      </Container>
    );
  }

  if (!vendor) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Vendor not found</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 8, bgcolor: 'background.default' }}>
      {vendor && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Box 
              sx={{
                width: '100%',
                height: '50vh',
                minHeight: '400px',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: vendor.images && vendor.images[0] ? `url(${getImageUrl(vendor.images[0])})` : `url(${UPLOADS_URL}/Logo.jpg)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0.1) 100%)',
                  zIndex: 1,
                }
              }}
            >
              <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pb: 6 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Typography variant="h2" sx={{ color: '#fff', fontWeight: 800, mb: 1, textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                    {vendor.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Rating value={vendor.rating || 0} readOnly precision={0.5} sx={{ color: '#FFD700' }} />
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                      ({vendor.reviews?.length || 0} reviews)
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                    {vendor.location && (
                      <Chip icon={<LocationOnIcon />} label={vendor.location} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(10px)' }} />
                    )}
                    {vendor.phone && (
                      <Chip icon={<PhoneIcon />} label={vendor.phone} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(10px)' }} />
                    )}
                    {vendor.email && (
                      <Chip icon={<EmailIcon />} label={vendor.email} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(10px)' }} />
                    )}
                  </Stack>
                </motion.div>
              </Container>
            </Box>
          </motion.div>
          <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 3 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <Card elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                <Typography variant="h6" gutterBottom fontWeight={700}>About {vendor.name}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {vendor.description}
                </Typography>
              </Card>
            </motion.div>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label="PRODUCTS & SERVICES" />
              <Tab label="GALLERY" />
              <Tab label="REVIEWS" />
            </Tabs>
          </Box>

          {selectedTab === 0 && (
            <Grid container spacing={3}>
              {vendor.products?.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <Card>
                    {product.images && product.images.length > 0 && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={getProductImageUrl(product.images[0])}
                        alt={product.name}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleImageClick(getProductImageUrl(product.images[0]))}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {product.description}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{product.price}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => handleBookNow(product)}
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {selectedTab === 1 && (
            <ImageList cols={3} gap={8}>
              {getAllImages().map((image, index) => (
                <ImageListItem key={index} sx={{ cursor: 'pointer' }}>
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    loading="lazy"
                    style={{ height: '200px', objectFit: 'cover' }}
                    onClick={() => handleImageClick(image)}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}

          {selectedTab === 2 && (
            <Box>
              {vendor.reviews?.length > 0 ? (
                vendor.reviews.map((review, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {review.comment}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {new Date(review.date).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No reviews yet.
                </Typography>
              )}
            </Box>
          )}

          {/* Image Preview Dialog */}
          <Dialog
            open={openImageDialog}
            onClose={handleCloseImageDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogContent sx={{ p: 0 }}>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '80vh',
                    objectFit: 'contain'
                  }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseImageDialog}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Booking Dialog */}
          <Dialog open={openBooking} onClose={() => setOpenBooking(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5">Book {selectedProduct?.name}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Please provide all the details for your booking
              </Typography>
            </DialogTitle>
            <Divider />
            <DialogContent>
              {bookingError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {bookingError}
                </Alert>
              )}
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Event Date"
                      value={bookingDate}
                      onChange={setBookingDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!formErrors.date,
                          helperText: formErrors.date,
                          InputProps: {
                            startAdornment: (
                              <EventIcon color="action" sx={{ mr: 1 }} />
                            ),
                          },
                        },
                      }}
                      minDate={new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="Event Time"
                      value={bookingTime}
                      onChange={setBookingTime}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!formErrors.time,
                          helperText: formErrors.time,
                          InputProps: {
                            startAdornment: (
                              <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                            ),
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Location"
                    value={bookingLocation}
                    onChange={(e) => setBookingLocation(e.target.value)}
                    error={!!formErrors.location}
                    helperText={formErrors.location}
                    InputProps={{
                      startAdornment: (
                        <LocationOnIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Number of Attendees"
                    type="number"
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(e.target.value)}
                    error={!!formErrors.attendees}
                    helperText={formErrors.attendees}
                    InputProps={{
                      startAdornment: (
                        <PeopleIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!formErrors.eventType}>
                    <InputLabel id="event-type-label">Event Type</InputLabel>
                    <Select
                      labelId="event-type-label"
                      value={eventType}
                      label="Event Type"
                      onChange={(e) => setEventType(e.target.value)}
                    >
                      <MenuItem value="wedding">Wedding</MenuItem>
                      <MenuItem value="birthday">Birthday</MenuItem>
                      <MenuItem value="corporate">Corporate Event</MenuItem>
                      <MenuItem value="conference">Conference</MenuItem>
                      <MenuItem value="party">Party</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                    {formErrors.eventType && (
                      <FormHelperText>{formErrors.eventType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone}
                    InputProps={{
                      startAdornment: (
                        <PhoneIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Notes"
                    placeholder="Any special requirements or details about your event"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={() => setOpenBooking(false)} 
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleBookingSubmit}
                disabled={createBookingMutation.isPending}
                startIcon={createBookingMutation.isPending ? <CircularProgress size={20} /> : null}
              >
                Confirm Booking
              </Button>
            </DialogActions>
          </Dialog>
          </Container>
        </>
      )}
    </Box>
  );
};

export default VendorDetails;
