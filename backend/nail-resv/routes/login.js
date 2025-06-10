const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password } = req.body;
  const supabase = req.supabase;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // 登入驗證
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const userId = data.user.id;
    console.log('User logged in:', userId, email);

    // 取得用戶角色資訊
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    // 取得用戶詳細資訊
    let userDetails = null;
    if (profileData.role === 'customer') {
      const { data: customerData } = await supabase
        .from('customers')
        .select('user_name')
        .eq('user_id', userId)
        .single();
      
      userDetails = {
        name: customerData?.user_name || 'Unknown'
      };
    } else if (profileData.role === 'artist') {
      const { data: artistData } = await supabase
        .from('artists')
        .select('studio_name')
        .eq('user_id', userId)
        .single();
      
      userDetails = {
        name: artistData?.studio_name || 'Unknown'
      };
    }

    res.json({
      message: 'Login successful',
      user: {
        id: userId,
        email: email,
        role: profileData.role,
        name: userDetails?.name || 'Unknown'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;