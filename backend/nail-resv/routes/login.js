const express = require('express');
const router = express.Router();


router.post('/', async (req, res) => {
  const { email, password } = req.body;
  const supabase = req.supabase;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.json({
    message: 'Login successful',
    //session: data.session,
    //user: data.user,
  });
});

module.exports = router;
