const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const supabase = req.supabase;
  
  try {
    // 登出 Supabase session
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    
    console.log('User logged out successfully');
    res.json({ 
      success: true,
      message: 'Logout successful' 
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;