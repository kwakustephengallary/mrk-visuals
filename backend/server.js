require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = 'https://mrk-visuals-api.onrender.com';

app.use(cors({
  origin: ['https://mrk-visuals.vercel.app', 'https://www.mrkvisualsgh.com', 'https://mrkvisualsgh.com']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
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
    if (extname && mimetype) cb(null, true);
    else cb(new Error('Only images allowed!'));
  }
});

let galleries = [];

// Get all galleries
app.get('/api/galleries', (req, res) => {
  // Only return public galleries for general requests
  const publicGalleries = galleries.filter(g => g.privacy === 'public');
  res.json(publicGalleries);
});

// Get single gallery by slug (with access check)
app.get('/api/galleries/:slug', (req, res) => {
  const gallery = galleries.find(g => g.slug === req.params.slug);
  if (!gallery) {
    return res.status(404).json({ error: 'Gallery not found' });
  }

  // If private, check access
  if (gallery.privacy === 'private') {
    const { email, password } = req.query;
    if (email !== gallery.clientEmail || password !== gallery.password) {
      return res.json({ ...gallery, photos: [], accessDenied: true });
    }
  }

  res.json(gallery);
});

// Create gallery
app.post('/api/galleries', upload.array('photos', 100), (req, res) => {
  try {
    const { 
      title, date, price, password, privacy, clientEmail,
      pricingType, installmentPlan 
    } = req.body;
    
    const files = req.files;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slug}-${uuidv4().slice(0, 6)}`;

    // Parse per-photo prices if provided
    let photoPrices = [];
    if (pricingType === 'per-photo') {
      photoPrices = req.body.photoPrices ? JSON.parse(req.body.photoPrices) : [];
    }

    // Parse installment plan
    let installment = null;
    if (pricingType === 'installment' && installmentPlan) {
      installment = JSON.parse(installmentPlan);
    }

    const photos = files.map((file, index) => ({
      id: uuidv4(),
      url: `${BASE_URL}/uploads/${file.filename}`,
      filename: file.filename,
      price: pricingType === 'per-photo' ? (photoPrices[index] || 0) : 0,
      order: index
    }));

    const gallery = {
      id: uuidv4(),
      title,
      slug: uniqueSlug,
      date,
      price: pricingType === 'full' ? parseFloat(price) : 0,
      password: password || '',
      privacy: privacy || 'public',
      clientEmail: clientEmail || '',
      pricingType: pricingType || 'full', // 'full', 'per-photo', 'installment'
      installment: installment,
      coverImage: photos.length > 0 ? photos[0].url : '',
      photos,
      isLocked: true,
      isPaid: false,
      paidAmount: 0,
      unlockedPhotos: [], // IDs of unlocked photos
      createdAt: new Date().toISOString()
    };

    galleries.push(gallery);
    res.status(201).json(gallery);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create gallery' });
  }
});

// Delete gallery
app.delete('/api/galleries/:id', (req, res) => {
  const index = galleries.findIndex(g => g.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  
  const gallery = galleries[index];
  gallery.photos.forEach(photo => {
    const filePath = path.join(__dirname, 'uploads', photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  galleries.splice(index, 1);
  res.json({ message: 'Deleted' });
});

// Update gallery (paid status, unlock photos)
app.patch('/api/galleries/:id', (req, res) => {
  const { id } = req.params;
  const { isPaid, isLocked, paidAmount, unlockedPhotoIds } = req.body;
  
  const gallery = galleries.find(g => g.id === id);
  if (!gallery) return res.status(404).json({ error: 'Not found' });

  if (isPaid !== undefined) {
    gallery.isPaid = isPaid;
    gallery.isLocked = !isPaid;
  }
  if (isLocked !== undefined) gallery.isLocked = isLocked;
  if (paidAmount !== undefined) gallery.paidAmount = paidAmount;
  if (unlockedPhotoIds) gallery.unlockedPhotos = unlockedPhotoIds;

  // If fully paid, unlock all
  if (gallery.isPaid) {
    gallery.unlockedPhotos = gallery.photos.map(p => p.id);
  }

  res.json(gallery);
});

// Verify Paystack payment
app.post('/api/verify-payment', async (req, res) => {
  const { reference, galleryId, photoIds } = req.body;
  
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    
    const data = await response.json();
    
    if (data.status && data.data.status === 'success') {
      const gallery = galleries.find(g => g.id === galleryId);
      if (gallery) {
        const amount = data.data.amount / 100;
        gallery.paidAmount = (gallery.paidAmount || 0) + amount;

        if (photoIds && photoIds.length > 0) {
          // Unlock specific photos
          gallery.unlockedPhotos = [...(gallery.unlockedPhotos || []), ...photoIds];
        }

        // Check if fully paid
        if (gallery.pricingType === 'full' && gallery.paidAmount >= gallery.price) {
          gallery.isPaid = true;
          gallery.isLocked = false;
          gallery.unlockedPhotos = gallery.photos.map(p => p.id);
        } else if (gallery.pricingType === 'installment' && gallery.installment) {
          const totalInstallment = gallery.installment.parts.reduce((sum: number, p: any) => sum + p.amount, 0);
          if (gallery.paidAmount >= totalInstallment) {
            gallery.isPaid = true;
            gallery.isLocked = false;
            gallery.unlockedPhotos = gallery.photos.map(p => p.id);
          }
        }

        res.json({ success: true, gallery });
      } else {
        res.json({ success: false, error: 'Gallery not found' });
      }
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});