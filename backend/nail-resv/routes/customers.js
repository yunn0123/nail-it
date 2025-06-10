// backend/nail-resv/routes/customers.js
const express = require('express');
const router = express.Router();

// 獲取顧客資料
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.supabase;

    console.log('Searching for customer with user_id:', id);

    // 只查詢確定存在的欄位
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('user_id, user_name, avatar_url')
      .eq('user_id', id);

    console.log('Customer query result:', customerData);
    console.log('Customer query error:', customerError);

    if (customerError) {
      console.error('Customer fetch error:', customerError);
      return res.status(404).json({ error: 'Customer query failed', details: customerError.message });
    }

    if (!customerData || customerData.length === 0) {
      console.log('No customer found with this user_id');
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = customerData[0];

    // 從 auth.users 獲取 email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id);
    
    if (authError) {
      console.error('Auth user fetch error:', authError);
      return res.status(404).json({ error: 'User not found' });
    }

    // 組合完整的顧客資料
    const customerProfile = {
      id: customer.user_id,
      email: authUser.user.email,
      name: customer.user_name,
      avatar_url: customer.avatar_url,
      // created_at 從 auth.users 取得
      created_at: authUser.user.created_at
    };

    res.json({
      success: true,
      customer: customerProfile
    });

  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 更新顧客資料
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const supabase = req.supabase;

    // 更新 customers 表格
    const { data, error } = await supabase
      .from('customers')
      .update({
        user_name: name
      })
      .eq('user_id', id)
      .select();

    if (error) {
      console.error('Customer update error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer: data[0]
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 獲取顧客的預約記錄
router.get('/:id/appointments', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.supabase;

    // 這裡假設你有 appointments 表格
    // 如果還沒有，可以先回傳空陣列
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        artists:artist_id (
          studio_name,
          user_id
        )
      `)
      .eq('customer_id', id)
      .gte('appointment_date', new Date().toISOString().split('T')[0]) // 只取今天之後的預約
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error('Appointments fetch error:', error);
      // 如果 appointments 表格不存在，先回傳空陣列
      return res.json({
        success: true,
        appointments: []
      });
    }

    res.json({
      success: true,
      appointments: appointments || []
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;