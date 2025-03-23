const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Import services
// Temporarily commenting out RAG service due to compatibility issues
// const ragService = require('./rag_service');
const petApiService = require('./pet_api_service');
const captchaService = require('./captcha_service');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Temporarily disable RAG service routes
// app.use('/api/chatbot', ragService);

// Import chatbot service
const chatbotService = require('./chatbot_service');

// Add endpoint for chatbot
app.post('/api/chatbot/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const response = await chatbotService.processQuery(query);
    res.json(response);
  } catch (error) {
    console.error('Error processing chatbot query:', error);
    res.status(500).json({
      answer: "I'm having trouble connecting to my knowledge base right now. Please try again later or contact our staff directly for assistance.",
      sources: []
    });
  }
});

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Kk2150100655',
  database: process.env.DB_NAME || 'pet_hotel',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    console.log('Continuing without database connection...');
    return false;
  }
}

// Try to connect but continue even if it fails
testConnection();

// Start server with available port
let currentPort = parseInt(PORT, 10);
const startServer = () => {
  app.listen(currentPort, () => {
    console.log(`Server is running on port ${currentPort}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${currentPort} is busy, trying port ${currentPort + 1}`);
      currentPort += 1;
      startServer();
    } else {
      console.error('Server error:', err);
    }
  });
};

// Only call startServer once
startServer();

// Routes
app.get('/', (req, res) => {
  res.send('Pet Hotel API is running');
});

// Pet API Routes
// Get dog breeds
app.get('/api/pets/dogs', async (req, res) => {
  try {
    const { query } = req.query;
    const breeds = await petApiService.getDogBreeds(query);
    res.json(breeds);
  } catch (error) {
    console.error('Error fetching dog breeds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cat breeds
app.get('/api/pets/cats', async (req, res) => {
  try {
    const { query } = req.query;
    const breeds = await petApiService.getCatBreeds(query);
    res.json(breeds);
  } catch (error) {
    console.error('Error fetching cat breeds:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pet care tips
app.get('/api/pets/care-tips', async (req, res) => {
  try {
    const { petType } = req.query;
    const tips = await petApiService.getPetCareTips(petType);
    res.json(tips);
  } catch (error) {
    console.error('Error fetching pet care tips:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get boarding information
app.get('/api/pets/boarding-info', (req, res) => {
  try {
    const boardingInfo = petApiService.getBoardingInfo();
    res.json(boardingInfo);
  } catch (error) {
    console.error('Error fetching boarding info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get grooming information
app.get('/api/pets/grooming-info', (req, res) => {
  try {
    const groomingInfo = petApiService.getGroomingInfo();
    res.json(groomingInfo);
  } catch (error) {
    console.error('Error fetching grooming info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bookings');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    if (error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ECONNREFUSED') {
      res.status(503).json({ message: 'Database service unavailable' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Get booking by ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify CAPTCHA
app.post('/api/verify-captcha', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'CAPTCHA token is required' });
    }
    
    const isValid = await captchaService.verifyCaptcha(token);
    
    if (isValid) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'CAPTCHA verification failed' });
    }
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new booking
app.post('/api/bookings', async (req, res) => {
  const {
    petName,
    petType,
    petBreed,
    petAge,
    ownerName,
    ownerEmail,
    ownerPhone,
    startDate,
    endDate,
    selectedRoom,
    timeSlot,
    additionalServices,
    specialRequirements,
    totalCost,
    status = 'pending' // Default status is pending
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO bookings (
        pet_name, pet_type, pet_breed, pet_age, 
        owner_name, owner_email, owner_phone, 
        start_date, end_date, room_type, time_slot,
        additional_services, special_requirements, total_cost, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        petName, petType, petBreed, petAge,
        ownerName, ownerEmail, ownerPhone,
        startDate, endDate, selectedRoom, timeSlot,
        JSON.stringify(additionalServices), specialRequirements, totalCost, status
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking
app.put('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  const {
    petName,
    petType,
    petBreed,
    petAge,
    ownerName,
    ownerEmail,
    ownerPhone,
    startDate,
    endDate,
    selectedRoom,
    timeSlot,
    additionalServices,
    specialRequirements,
    totalCost,
    status
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE bookings SET 
        pet_name = ?, pet_type = ?, pet_breed = ?, pet_age = ?, 
        owner_name = ?, owner_email = ?, owner_phone = ?, 
        start_date = ?, end_date = ?, room_type = ?, time_slot = ?,
        additional_services = ?, special_requirements = ?, total_cost = ?, status = ?
      WHERE id = ?`,
      [
        petName, petType, petBreed, petAge,
        ownerName, ownerEmail, ownerPhone,
        startDate, endDate, selectedRoom, timeSlot,
        JSON.stringify(additionalServices), specialRequirements, totalCost, status,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Email notification endpoint
app.post('/api/send-email', async (req, res) => {
  const { to, subject, text } = req.body;
  
  try {
    // In a production environment, you would use a proper email service like Nodemailer
    // For this demo, we'll just log the email details and return success
    console.log('Email notification would be sent with the following details:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);
    
    // To implement actual email sending, you would use code like this:
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text
    };
    
    await transporter.sendMail(mailOptions);
    */
    
    res.status(200).json({ message: 'Email notification sent successfully' });
  } catch (error) {
    console.error('Error sending email notification:', error);
    res.status(500).json({ message: 'Failed to send email notification' });
  }
});

// Server is already started by the startServer function above
// No need to start it again