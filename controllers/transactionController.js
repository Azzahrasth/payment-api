const pool = require('../db/connection');
// untuk format tanggal invoice
const dayjs = require('dayjs');

exports.getBalance = async (req, res) => {
  try {
    const email = req.user.email;
    const [rows] = await pool.query('SELECT balance FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ status: 404, message: 'User tidak ditemukan', data: null });
    }

    res.json({
      status: 0,
      message: 'Get Balance Berhasil',
      data: { balance: parseFloat(rows[0].balance) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 500, message: 'Internal server error', data: null });
  }
};

exports.topUp = async (req, res) => {
  const email = req.user.email;
  const { top_up_amount } = req.body;

  // validasi angka
  if (isNaN(top_up_amount) || top_up_amount <= 0) {
    return res.status(400).json({
      status: 102,
      message: 'Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0',
      data: null,
    });
  }

  // bikin koneksi
  const conn = await pool.getConnection();
  try {
    // mulai transaksi database
    await conn.beginTransaction();

    // Ambil saldo lama + kunci baris (FOR UPDATE)
    const [userRows] = await conn.execute('SELECT balance FROM users WHERE email = ? FOR UPDATE', [email]);
    if (userRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ status: 404, message: 'User tidak ditemukan', data: null });
    }

    const oldBalance = parseFloat(userRows[0].balance);
    const newBalance = oldBalance + parseFloat(top_up_amount);

    // Update saldo
    await conn.execute('UPDATE users SET balance = ? WHERE email = ?', [newBalance, email]);

    // Catat transaksi
    const invoice = `INV${dayjs().format('YYMMDDHHmmss')}`;
    await conn.execute(
      `INSERT INTO transactions (invoice_number, email, transaction_type, description, total_amount, created_on)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [invoice, email, 'TOPUP', 'Top Up balance', top_up_amount, new Date()]
    );

    await conn.commit();
    conn.release();

    res.json({
      status: 0,
      message: 'Top Up Balance berhasil',
      data: { balance: newBalance },
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ status: 500, message: 'Internal server error', data: null });
  }
};

exports.makeTransaction = async (req, res) => {
  const email = req.user.email;
  const { service_code } = req.body;
  
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Cek service
    const [serviceRows] = await conn.execute('SELECT * FROM services WHERE service_code = ?', [service_code]);
    if (serviceRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ status: 102, message: 'Service atau Layanan tidak ditemukan', data: null });
    }
    const service = serviceRows[0];

    // Ambil saldo + kunci baris (FOR UPDATE)
    const [userRows] = await conn.execute('SELECT balance FROM users WHERE email = ? FOR UPDATE', [email]);
    if (userRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ status: 404, message: 'User tidak ditemukan', data: null });
    }

    const balance = parseFloat(userRows[0].balance);
    if (balance < service.service_tariff) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        status: 102,
        message: 'Saldo tidak mencukupi untuk melakukan transaksi',
        data: null,
      });
    }

    // Kurangi saldo
    const newBalance = balance - service.service_tariff;
    await conn.execute('UPDATE users SET balance = ? WHERE email = ?', [newBalance, email]);

    // Catat transaksi pembayaran
    const invoice = `INV${dayjs().format('YYMMDDHHmmss')}`;
    await conn.execute(
      `INSERT INTO transactions (invoice_number, email, service_code, transaction_type, description, total_amount, created_on)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice,
        email,
        service.service_code,
        'PAYMENT',
        service.service_name,
        service.service_tariff,
        new Date(),
      ]
    );

    await conn.commit();
    conn.release();

    res.json({
      status: 0,
      message: 'Transaksi berhasil',
      data: {
        invoice_number: invoice,
        service_code: service.service_code,
        service_name: service.service_name,
        transaction_type: 'PAYMENT',
        total_amount: parseFloat(service.service_tariff),
        created_on: new Date(),
      },
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ status: 500, message: 'Internal server error', data: null });
  }
};

exports.getHistory = async (req, res) => {
  const email = req.user.email;
  const { limit, offset } = req.query;

  try {
    let query = `
      SELECT 
        invoice_number, 
        transaction_type, 
        description, 
        CAST(total_amount AS UNSIGNED) AS total_amount,
        created_on 
      FROM transactions 
      WHERE email = ?
      ORDER BY created_on DESC
    `;

    const params = [email];

    if (limit && offset) {
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
    } else if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }


    const [records] = await pool.query(query, params);

    res.json({
      status: 0,
      message: 'Get History Berhasil',
      data: {
        offset: offset ? parseInt(offset) : 0,
        limit: limit ? parseInt(limit) : records.length,
        records,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: null,
    });
  }
};

