const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = 'https://mrk-visuals-api.onrender.com';

// Middleware
app.use(cors({
  origin: 'https://mrk-visuals.vercel.app'
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'));
    }
  }
});

// In-memory storage (replace with real database later)
let galleries = [];

// Get all galleries
app.get('/api/galleries', (req, res) => {
  res.json(galleries);
});

// Get single gallery by slug
app.get('/api/galleries/:slug', (req, res) => {
  const gallery = galleries.find(g => g.slug === req.params.slug);
  if (!gallery) {
    return res.status(404).json({ error: 'Gallery not found' });
  }
  res.json(gallery);
});

// Create gallery with photo uploads
app.post('/api/galleries', upload.array('photos', 100), (req, res) => {
  try {
    const { title, date, price, password } = req.body;
    const files = req.files;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const photos = files.map(file => ({
      id: uuidv4(),
      url: `${BASE_URL}/uploads/${file.filename}`,
      filename: file.filename
    }));

    const gallery = {
      id: uuidv4(),
      title,
      slug,
      date,
      price: parseFloat(price),
      password,
      coverImage: photos.length > 0 ? photos[0].url : '',
      photos,
      isLocked: true,
      isPaid: false,
      createdAt: new Date().toISOString()
    };

    galleries.push(gallery);

    res.status(201).json(gallery);
  } catch (error) {
    console.error('Error creating gallery:', error);
    res.status(500).json({ error: 'Failed to create gallery' });
  }
});

// Delete gallery
app.delete('/api/galleries/:id', (req, res) => {
  const index = galleries.findIndex(g => g.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Gallery not found' });
  }
  
  const gallery = galleries[index];
  gallery.photos.forEach(photo => {
    const filePath = path.join(__dirname, 'uploads', photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  galleries.splice(index, 1);
  res.json({ message: 'Gallery deleted' });
});

// Update gallery paid status
app.patch('/api/galleries/:id', (req, res) => {
  const { id } = req.params;
  const { isPaid, isLocked } = req.body;
  
  const gallery = galleries.find(g => g.id === id);
  if (!gallery) {
    return res.status(404).json({ error: 'Gallery not found' });
  }

  if (isPaid !== undefined) {
    gallery.isPaid = isPaid;
    gallery.isLocked = false;
  }
  if (isLocked !== undefined) {
    gallery.isLocked = isLocked;
  }

  res.json(gallery);
});
// Verify Paystack payment
app.post('/api/verify-payment', async (req, res) => {
  const { reference, galleryId } = req.body;
  
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: 'Bearer sk_live_96a1cfdf25904053711b4947c354d885af83b303', // REPLACE WITH YOUR SECRET KEY
      },
    });
    
    const data = await response.json();
    
    if (data.status && data.data.status === 'success') {
      // Mark gallery as paid
      const gallery = galleries.find(g => g.id === galleryId);
      if (gallery) {
        gallery.isPaid = true;
        gallery.isLocked = false;
      }
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});