require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = 'https://mrk-visuals-api.onrender.com';

app.use(cors({
  origin: ['https://mrk-visuals.vercel.app', 'https://www.mrkvisualsgh.com', 'https://mrkvisualsgh.com', 'http://localhost:3000']
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

// Get all galleries (public only)
app.get('/api/galleries', (req, res) => {
  const galleries = db.prepare("SELECT * FROM galleries WHERE privacy = 'public'").all();
  const result = galleries.map(g => ({
    ...g,
    isLocked: !!g.isLocked,
    isPaid: !!g.isPaid,
    installment: g.installment ? JSON.parse(g.installment) : null,
    unlockedPhotos: JSON.parse(g.unlockedPhotos || '[]'),
    photos: db.prepare("SELECT * FROM photos WHERE gallery_id = ? ORDER BY photoOrder").all(g.id)
  }));
  res.json(result);
});

// Get ALL galleries (admin)
app.get('/api/all-galleries', (req, res) => {
  const galleries = db.prepare("SELECT * FROM galleries ORDER BY createdAt DESC").all();
  const result = galleries.map(g => ({
    ...g,
    isLocked: !!g.isLocked,
    isPaid: !!g.isPaid,
    installment: g.installment ? JSON.parse(g.installment) : null,
    unlockedPhotos: JSON.parse(g.unlockedPhotos || '[]'),
    photos: db.prepare("SELECT * FROM photos WHERE gallery_id = ? ORDER BY photoOrder").all(g.id)
  }));
  res.json(result);
});

// Get single gallery
app.get('/api/galleries/:slug', (req, res) => {
  const gallery = db.prepare("SELECT * FROM galleries WHERE slug = ?").get(req.params.slug);
  if (!gallery) return res.status(404).json({ error: 'Not found' });

  const photos = db.prepare("SELECT * FROM photos WHERE gallery_id = ? ORDER BY photoOrder").all(gallery.id);

  if (gallery.privacy === 'private') {
    const { email, password } = req.query;
    if (email !== gallery.clientEmail || password !== gallery.password) {
      return res.json({ ...gallery, photos: [], accessDenied: true });
    }
  }

  res.json({
    ...gallery,
    isLocked: !!gallery.isLocked,
    isPaid: !!gallery.isPaid,
    installment: gallery.installment ? JSON.parse(gallery.installment) : null,
    unlockedPhotos: JSON.parse(gallery.unlockedPhotos || '[]'),
    photos
  });
});

// Create gallery
app.post('/api/galleries', upload.array('photos', 100), (req, res) => {
  try {
    const { title, date, price, password, privacy, clientEmail, pricingType, installmentPlan } = req.body;
    const files = req.files;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + uuidv4().slice(0, 6);
    const id = uuidv4();
    const coverImage = files.length > 0 ? `${BASE_URL}/uploads/${files[0].filename}` : '';

    let photoPrices = [];
    if (pricingType === 'per-photo' && req.body.photoPrices) {
      photoPrices = JSON.parse(req.body.photoPrices);
    }

    db.prepare(`INSERT INTO galleries (id, title, slug, date, price, password, privacy, clientEmail, pricingType, installment, coverImage, isLocked, isPaid, paidAmount, unlockedPhotos, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, '[]', ?)`).run(
      id, title, slug, date, parseFloat(price) || 0, password || '', privacy || 'public', clientEmail || '', pricingType || 'full', installmentPlan || null, coverImage, new Date().toISOString()
    );

    const insertPhoto = db.prepare("INSERT INTO photos (id, gallery_id, url, filename, price, photoOrder) VALUES (?, ?, ?, ?, ?, ?)");
    files.forEach((file, i) => {
      insertPhoto.run(uuidv4(), id, `${BASE_URL}/uploads/${file.filename}`, file.filename, photoPrices[i] || 0, i);
    });

    const gallery = db.prepare("SELECT * FROM galleries WHERE id = ?").get(id);
    const photos = db.prepare("SELECT * FROM photos WHERE gallery_id = ?").all(id);

    res.status(201).json({ ...gallery, photos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create gallery' });
  }
});

// Update gallery
app.patch('/api/galleries/:id', (req, res) => {
  const { id } = req.params;
  const { isPaid, isLocked, paidAmount, unlockedPhotoIds, title, price, password, privacy } = req.body;

  const gallery = db.prepare("SELECT * FROM galleries WHERE id = ?").get(id);
  if (!gallery) return res.status(404).json({ error: 'Not found' });

  if (title) db.prepare("UPDATE galleries SET title = ? WHERE id = ?").run(title, id);
  if (price !== undefined) db.prepare("UPDATE galleries SET price = ? WHERE id = ?").run(price, id);
  if (password) db.prepare("UPDATE galleries SET password = ? WHERE id = ?").run(password, id);
  if (privacy) db.prepare("UPDATE galleries SET privacy = ? WHERE id = ?").run(privacy, id);

  if (isPaid !== undefined) {
    db.prepare("UPDATE galleries SET isPaid = ?, isLocked = ? WHERE id = ?").run(isPaid ? 1 : 0, isPaid ? 0 : 1, id);
    if (isPaid) {
      const allPhotoIds = db.prepare("SELECT id FROM photos WHERE gallery_id = ?").all(id).map(p => p.id);
      db.prepare("UPDATE galleries SET unlockedPhotos = ? WHERE id = ?").run(JSON.stringify(allPhotoIds), id);
    }
  }
  if (isLocked !== undefined) db.prepare("UPDATE galleries SET isLocked = ? WHERE id = ?").run(isLocked ? 1 : 0, id);
  if (paidAmount !== undefined) db.prepare("UPDATE galleries SET paidAmount = ? WHERE id = ?").run(paidAmount, id);
  if (unlockedPhotoIds) db.prepare("UPDATE galleries SET unlockedPhotos = ? WHERE id = ?").run(JSON.stringify(unlockedPhotoIds), id);

  const updated = db.prepare("SELECT * FROM galleries WHERE id = ?").get(id);
  const photos = db.prepare("SELECT * FROM photos WHERE gallery_id = ?").all(id);
  res.json({ ...updated, photos });
});

// Delete gallery
app.delete('/api/galleries/:id', (req, res) => {
  const gallery = db.prepare("SELECT * FROM galleries WHERE id = ?").get(req.params.id);
  if (!gallery) return res.status(404).json({ error: 'Not found' });

  const photos = db.prepare("SELECT * FROM photos WHERE gallery_id = ?").all(req.params.id);
  photos.forEach(p => {
    const filePath = path.join(__dirname, 'uploads', p.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  db.prepare("DELETE FROM photos WHERE gallery_id = ?").run(req.params.id);
  db.prepare("DELETE FROM galleries WHERE id = ?").run(req.params.id);
  res.json({ message: 'Deleted' });
});

// Verify payment
app.post('/api/verify-payment', async (req, res) => {
  const { reference, galleryId, photoIds } = req.body;
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      const gallery = db.prepare("SELECT * FROM galleries WHERE id = ?").get(galleryId);
      if (gallery) {
        const amount = data.data.amount / 100;
        const newPaidAmount = (gallery.paidAmount || 0) + amount;

        let unlockedPhotos = JSON.parse(gallery.unlockedPhotos || '[]');
        if (photoIds && photoIds.length > 0) {
          unlockedPhotos = [...new Set([...unlockedPhotos, ...photoIds])];
        }

        const pricingType = gallery.pricingType;
        let isFullyPaid = false;

        if (pricingType === 'full' && newPaidAmount >= gallery.price) {
          isFullyPaid = true;
          const allPhotos = db.prepare("SELECT id FROM photos WHERE gallery_id = ?").all(galleryId).map(p => p.id);
          unlockedPhotos = allPhotos;
        } else if (pricingType === 'installment' && gallery.installment) {
          const installment = JSON.parse(gallery.installment);
          const total = installment.parts.reduce((s, p) => s + p.amount, 0);
          if (newPaidAmount >= total) {
            isFullyPaid = true;
            const allPhotos = db.prepare("SELECT id FROM photos WHERE gallery_id = ?").all(galleryId).map(p => p.id);
            unlockedPhotos = allPhotos;
          }
        }

        db.prepare("UPDATE galleries SET paidAmount = ?, unlockedPhotos = ?, isPaid = ?, isLocked = ? WHERE id = ?").run(
          newPaidAmount, JSON.stringify(unlockedPhotos), isFullyPaid ? 1 : 0, isFullyPaid ? 0 : 1, galleryId
        );

        res.json({ success: true });
      } else {
        res.json({ success: false });
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