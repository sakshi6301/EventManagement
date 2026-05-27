import { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, Button,
  Box, Paper, useTheme, alpha
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  ArrowForward, Celebration, Restaurant, PhotoCamera,
  MusicNote, Deck, EmojiEvents
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

// Motion Components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionCard = motion(Card);

const mockCategories = [
  { name: 'Venues', icon: <Deck sx={{ fontSize: 48 }} />, description: 'Find the perfect venue for your special day' },
  { name: 'Catering', icon: <Restaurant sx={{ fontSize: 48 }} />, description: 'Delicious menus for every taste and budget' },
  { name: 'Photography', icon: <PhotoCamera sx={{ fontSize: 48 }} />, description: 'Capture your precious moments forever' },
  { name: 'Entertainment', icon: <MusicNote sx={{ fontSize: 48 }} />, description: 'Keep your guests entertained all day' },
  { name: 'Decoration', icon: <Celebration sx={{ fontSize: 48 }} />, description: 'Make your event unforgettable' }
];

const Home = () => {
  const theme = useTheme();

  const getIconForCategory = (name) => {
    const iconMap = {
      'Venues': <Deck sx={{ fontSize: 48 }} />,
      'Catering': <Restaurant sx={{ fontSize: 48 }} />,
      'Photography': <PhotoCamera sx={{ fontSize: 48 }} />,
      'Entertainment': <MusicNote sx={{ fontSize: 48 }} />,
      'Decoration': <Celebration sx={{ fontSize: 48 }} />
    };
    return iconMap[name] || <EmojiEvents sx={{ fontSize: 48 }} />;
  };

  const { data: apiCategories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.map(category => ({
        ...category,
        icon: getIconForCategory(category.name)
      }));
    },
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  const categories = !categoriesLoading && !categoriesError && apiCategories.length > 0 
    ? apiCategories 
    : mockCategories;

  // Stagger variants for list animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box 
        sx={{
          position: 'relative',
          color: '#fff',
          height: '85vh',
          display: 'flex',
          alignItems: 'center',
          marginTop: '64px',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
            mixBlendMode: 'overlay',
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
            <MotionTypography
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              component="h1"
              variant="h1"
              sx={{ 
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '3rem', md: '5rem' },
                lineHeight: 1.1,
                textShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              Craft Your Perfect Event
            </MotionTypography>
            
            <MotionTypography
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              variant="h5"
              paragraph
              sx={{ 
                mb: 5,
                fontWeight: 300,
                opacity: 0.9,
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
            >
              Discover premium vendors, breathtaking venues, and extraordinary services all in one beautifully curated platform.
            </MotionTypography>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                component={Link}
                to="/vendors"
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: '#ffffff',
                  color: theme.palette.primary.main,
                  borderRadius: 50,
                  px: 5,
                  py: 1.8,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                  }
                }}
              >
                Explore Vendors
              </Button>
            </motion.div>
          </Box>
        </Container>
        
        {/* Animated Background Shapes */}
        <MotionBox
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          sx={{
            position: 'absolute',
            bottom: '-10%',
            right: '-5%',
            width: '40%',
            height: '40%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
            borderRadius: '50%',
            zIndex: 1
          }}
        />
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ 
              mb: 8, 
              fontWeight: 700,
              color: theme.palette.text.primary
            }}
          >
            Browse by Category
          </Typography>
        </MotionBox>

        <MotionBox
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Grid container spacing={4}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category.name}>
                <MotionCard 
                  variants={itemVariants}
                  whileHover={{ 
                    y: -10,
                    scale: 1.02,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                  }}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    overflow: 'visible',
                    border: 'none',
                    bgcolor: 'background.paper'
                  }}
                >
                  <Box
                    sx={{
                      p: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      position: 'relative'
                    }}
                  >
                    <Box 
                      className="float-animation"
                      sx={{ 
                        color: index % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
                        mb: 2,
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: '#ffffff',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700 }}>
                      {category.name}
                    </Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {category.description}
                    </Typography>
                    <Button
                      component={Link}
                      to={`/vendors?category=${category.name.toLowerCase()}`}
                      variant="text"
                      color={index % 2 === 0 ? "primary" : "secondary"}
                      endIcon={<ArrowForward />}
                      sx={{ fontWeight: 600, fontSize: '1rem' }}
                    >
                      Explore
                    </Button>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </MotionBox>

        {/* Call to Action Section */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper
            className="glassmorphism"
            sx={{
              mt: 12,
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              borderRadius: 6,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <EmojiEvents sx={{ fontSize: 64, color: theme.palette.secondary.main, mb: 3 }} />
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
              Are You an Elite Vendor?
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph sx={{ maxWidth: '600px', mx: 'auto', mb: 4, fontWeight: 400 }}>
              Join our exclusive platform, showcase your premium services, and connect with clients looking for perfection.
            </Typography>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
              <Button
                component={Link}
                to="/register?type=vendor"
                variant="contained"
                color="secondary"
                size="large"
                sx={{ px: 6, py: 2, fontSize: '1.1rem', borderRadius: 50 }}
              >
                Partner With Us
              </Button>
            </motion.div>
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Home;
