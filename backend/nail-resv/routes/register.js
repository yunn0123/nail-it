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

    // 檢查密碼長度
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password should be at least 6 characters' });
    }

    const supabase = req.supabase;

    console.log('Creating user:', email, 'with role:', role);

    // 建立用戶
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined
      }
    });

    if (signUpError) {
      console.error('Auth error:', signUpError);
      return res.status(400).json({ error: signUpError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'User creation failed' });
    }

    const userId = authData.user.id;
    console.log('User created with ID:', userId);

    // 手動建立 profile
    console.log('Creating profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ 
        id: userId, 
        role: role,
        created_at: new Date().toISOString()
      }]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    console.log('Profile created successfully');

    // 根據角色建立對應資料
    if (role === 'customer') {
      if (!username) {
        return res.status(400).json({ error: 'Username required for customer' });
      }

      console.log('Creating customer record...');
      const { error: customerError } = await supabase
        .from('customers')
        .insert([{ 
          user_id: userId, 
          user_name: username  // 修正：欄位名稱是 user_name
        }]);

      if (customerError) {
        console.error('Customer creation error:', customerError);
        return res.status(500).json({ error: 'Failed to create customer record' });
      }

      console.log('Customer record created successfully');

    } else if (role === 'artist') {
      if (!studio_name) {
        return res.status(400).json({ error: 'Studio name required for artist' });
      }

      console.log('Creating artist record...');
      const artistData = {
        user_id: userId,
        studio_name: studio_name,
        city: city || null,
        district: district || null,
        bio: bio || null,
        styles: styles || null
      };

      const { error: artistError } = await supabase
        .from('artists')
        .insert([artistData]);

      if (artistError) {
        console.error('Artist creation error:', artistError);
        return res.status(500).json({ error: 'Failed to create artist record' });
      }

      console.log('Artist record created successfully');
    }

    res.status(201).json({ 
      message: 'Registration successful', 
      id: userId,
      user: {
        email: authData.user.email,
        role: role
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

module.exports = { router };