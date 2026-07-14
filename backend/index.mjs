import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Neon uchun SSL talab qilinadi
});

// Hello World testi
app.get('/', (req, res) => {
  res.send('Hello World! Backend ishlayapti.');
});

// Bazaga text yozish API-si
app.post('/api/message', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Matn kiritish majburiy!' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO messages (text_content) VALUES ($1) RETURNING *',
      [text]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatoligi yuz berdi.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} portida ishga tushdi`);
});