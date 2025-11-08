const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// agar folder uploads dapat diakses secara publik melalui URL.
app.use('/uploads', express.static('uploads')); 

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/profile'));
app.use('/', require('./routes/info'));
app.use('/', require('./routes/transaction'));

// jalankan server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});


