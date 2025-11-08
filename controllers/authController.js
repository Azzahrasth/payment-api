const pool = require('../db/connection'); // koneksi database
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

exports.register = async (req, res) => {
  try {
    const { email, first_name, last_name, password } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(400).json({ status: 102, message: 'Parameter email tidak sesuai format', data: null });
    }
    if (password.length < 8) {
      return res.status(400).json({ status: 102, message: 'Password minimal 8 karakter', data: null });
    }

    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ status: 102, message: 'Email sudah terdaftar', data: null });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)', [email, first_name, last_name, hashed]);

    res.json({ status: 0, message: 'Registrasi berhasil silahkan login', data: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: 'Internal server error', data: null });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(400).json({ status: 102, message: 'Parameter email tidak sesuai format', data: null });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ status: 103, message: 'Username atau password salah', data: null });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ status: 103, message: 'Username atau password salah', data: null });
    }
    // buat token JWT
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ status: 0, message: 'Login Sukses', data: { token } });
  } catch (err) {
    res.status(500).json({ status: 500, message: 'Internal server error', data: null });
  }
};
