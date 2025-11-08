const pool = require('../db/connection');


exports.getProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const [rows] = await pool.query('SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 404, message: 'User tidak ditemukan', data: null });
    }

    res.json({ status: 0, message: 'Sukses', data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: 'Internal server error', data: null });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const { first_name, last_name } = req.body;

    await pool.query('UPDATE users SET first_name=?, last_name=? WHERE email=?', [first_name, last_name, email]);
    const [updated] = await pool.query('SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?', [email]);

    res.json({
      status: 0,
      message: 'Update Profile berhasil',
      data: updated[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: 'Internal server error', data: null });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const email = req.user.email;

    // kalau tidak ada file
    if (!req.file) {
      return res.status(400).json({
        status: 102,
        message: 'Format Image tidak sesuai',
        data: null
      });
    }

    // buat image URL
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    await pool.query('UPDATE users SET profile_image=? WHERE email=?', [imageUrl, email]);
    const [updated] = await pool.query('SELECT email, first_name, last_name, profile_image FROM users WHERE email = ?', [email]);

    res.json({
      status: 0,
      message: 'Update Profile Image berhasil',
      data: updated[0]
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null
    });
  }
};
