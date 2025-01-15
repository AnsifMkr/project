// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || `mongodb+srv://apasproject2025:vZV3SFgEnQ9e73wK@cluster0.mhaam.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.connect(MONGO_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'pharmacist'], required: true },
  age: Number,
  gender: String,
  address: String,
  phone: String,
  uid: { type: String, unique: true, required: true },
});

const User = mongoose.model('User', userSchema);
module.exports = User;

// Prescription Schema and Model
const prescriptionSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  type: { type: String, enum: ['diabetes', 'general'], required: true },
  details: { type: String, required: true },
  doctor: { type: String, required: true },
  date: { type: Date, default: Date.now },
  fulfilled: { type: Boolean, default: false }, // New field to track fulfillment status
});


const Prescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = Prescription;

// API Routes
// User Registration
app.post('/register', async (req, res) => {
  try {
    const { username, password, role, age, gender, address, phone, uid } = req.body;
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      age,
      gender,
      address,
      phone,
      uid,
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Username or UID already exists' });
    } else {
      console.error('Registration Error:', err.message);
      res.status(400).json({ error: 'An error occurred during registration. Please try again.' });
    }
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { uid, password } = req.body;
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ uid: user.uid, role: user.role }, process.env.ACCESS_TOKEN_SECRET || 'defaultsecret', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(400).json({ error: 'An error occurred during login. Please try again.' });
  }
});

// Fetch User Details
app.get('/user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Fetch User Error:', err.message);
    res.status(400).json({ error: 'An error occurred while fetching user details. Please try again.' });
  }
});

// Add Prescription
app.post('/prescription', async (req, res) => {
  try {
    const { uid, type, details, doctor } = req.body;
    const newPrescription = new Prescription({ uid, type, details, doctor });
    await newPrescription.save();
    res.status(201).json({ message: 'Prescription added successfully' });
  } catch (err) {
    console.error('Add Prescription Error:', err.message);
    res.status(400).json({ error: 'An error occurred while adding the prescription. Please try again.' });
  }
});

// Fetch Prescriptions by UID
app.get('/prescriptions/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const prescriptions = await Prescription.find({ uid });
    res.json(prescriptions);
  } catch (err) {
    console.error('Fetch Prescriptions Error:', err.message);
    res.status(400).json({ error: 'An error occurred while fetching prescriptions. Please try again.' });
  }
});

// Fetch all prescriptions (with optional filters for UID and doctor)
app.get('/pharmacist/prescriptions', async (req, res) => {
  try {
    const { uid, doctor } = req.query; // Optional query parameters for filtering
    const filters = {};
    if (uid) filters.uid = uid;
    if (doctor) filters.doctor = doctor;

    const prescriptions = await Prescription.find(filters);
    res.json(prescriptions);
  } catch (err) {
    console.error('Fetch All Prescriptions Error:', err.message);
    res.status(400).json({ error: 'An error occurred while fetching prescriptions. Please try again.' });
  }
});

// Mark a prescription as fulfilled
app.patch('/pharmacist/prescription/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      id,
      { fulfilled: true },
      { new: true } // Return the updated document
    );

    if (!updatedPrescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json({ message: 'Prescription marked as fulfilled', prescription: updatedPrescription });
  } catch (err) {
    console.error('Mark Prescription Fulfilled Error:', err.message);
    res.status(400).json({ error: 'An error occurred while updating the prescription. Please try again.' });
  }
});


// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
