const express = require('express');
const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const {
      role, email, password,
      username,
      studio_name, city, district, bio, styles
    } = req.body;

    if (!['customer', 'artist'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const supabase = req.supabase;

    // Create user in Supabase Auth
    const { data: authUser, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (signUpError) throw signUpError;
    const id = authUser.user.id;

    // Insert into profiles table
    const { error: profileErr } = await supabase
      .from('profiles')
      .insert([{ id, role }]);
    if (profileErr) throw profileErr;

    // Insert into either customers or artists
    if (role === 'customer') {
      if (!username) return res.status(400).json({ error: 'Username required' });
      const { error: customerErr } = await supabase
        .from('customers')
        .insert([{ user_id: id, username }]);
      if (customerErr) throw customerErr;
    } else if (role === 'artist') {
      if (!studio_name) return res.status(400).json({ error: 'Studio name required' });
      const artistData = {
        user_id: id,
        studio_name,
        city: city || null,
        district: district || null,
        bio: bio || null,
        styles: styles || null // should be JSON
      };
      const { error: artistErr } = await supabase
        .from('artists')
        .insert([artistData]);
      if (artistErr) throw artistErr;
    }

    res.status(201).json({ message: 'Registration successful', id });
  } catch (err) {
    next(err);
  }
});

module.exports = { router };
