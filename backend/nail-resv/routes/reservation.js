// routes/reservation.js
const express = require('express');
const router = express.Router();

// POST /api/reservations/book
// 顧客預約美甲服務
// Body: { customerId, artistId, date, time, note }
router.post('/book', async (req, res) => {
 try {
   const { customerId, artistId, date, time, note } = req.body;
   
   if (!customerId || !artistId || !date || !time) {
     return res.status(400).json({ error: 'Missing required fields: customerId, artistId, date, time' });
   }

   const supabase = req.supabase;
   
   // 驗證顧客存在
   const { data: customer, error: customerError } = await supabase
     .from('customers')
     .select('user_id, user_name')
     .eq('user_id', customerId)
     .single();
     
   if (customerError || !customer) {
     return res.status(404).json({ error: 'Customer not found' });
   }

   // 驗證美甲師存在
   const { data: artist, error: artistError } = await supabase
     .from('artists')
     .select('user_id, studio_name')
     .eq('user_id', artistId)
     .single();
     
   if (artistError || !artist) {
     return res.status(404).json({ error: 'Artist not found' });
   }

   // 驗證日期格式
   const dateObj = new Date(date + 'T00:00:00');
   if (isNaN(dateObj.getTime())) {
     return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
   }

   // 檢查是否為過去的日期
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   if (dateObj < today) {
     return res.status(400).json({ error: 'Cannot book appointments for past dates' });
   }

   // 檢查時段是否可用 - 使用內部 API 呼叫
   const PORT = process.env.PORT || 4000;
   const slotsUrl = `http://localhost:${PORT}/api/artists/${artistId}/slots?date=${date}`;
   
   try {
     const slotsResponse = await fetch(slotsUrl);
     const slotsData = await slotsResponse.json();
     
     if (!slotsResponse.ok || !slotsData.success) {
       return res.status(400).json({ error: 'Failed to check availability' });
     }
     
     if (!slotsData.availableSlots.includes(time)) {
       return res.status(400).json({ error: 'This time slot is not available' });
     }
   } catch (fetchError) {
     console.error('Failed to check slots:', fetchError);
     return res.status(500).json({ error: 'Failed to verify time slot availability' });
   }

   // 創建預約
   const { data: appointment, error: insertError } = await supabase
     .from('appointments')
     .insert([{
       customer_id: customerId,
       artist_id: artistId,
       service_date: date,
       service_time: time,
       status: 'pending', // 預設為待確認
       note: note || '',
       created_at: new Date().toISOString()
     }])
     .select()
     .single();

   if (insertError) {
     console.error('Create appointment error:', insertError);
     return res.status(500).json({ error: 'Failed to create appointment' });
   }

   res.status(201).json({
     success: true,
     message: 'Appointment booked successfully',
     appointment: {
       id: appointment.id,
       customerName: customer.user_name,
       artistName: artist.studio_name,
       date,
       time,
       status: 'pending',
       note: note || ''
     }
   });
   
 } catch (error) {
   console.error('Book appointment error:', error);
   res.status(500).json({ error: 'Internal server error' });
 }
});

// GET /api/reservations/artist/:artistId
// 獲取美甲師的所有預約
router.get('/artist/:artistId', async (req, res) => {
 try {
   const { artistId } = req.params;
   const { status, date } = req.query; // 可選的篩選條件
   
   const supabase = req.supabase;
   
   // 驗證美甲師存在
   const { data: artist, error: artistError } = await supabase
     .from('artists')
     .select('user_id, studio_name')
     .eq('user_id', artistId)
     .single();
     
   if (artistError || !artist) {
     return res.status(404).json({ error: 'Artist not found' });
   }

   // 建立查詢
   let query = supabase
     .from('appointments')
     .select(`
       id,
       service_date,
       service_time,
       status,
       note,
       created_at,
       customers!inner(user_id, user_name)
     `)
     .eq('artist_id', artistId)
     .order('service_date', { ascending: false })
     .order('service_time', { ascending: true });

   // 加入篩選條件
   if (status) {
     query = query.eq('status', status);
   }
   
   if (date) {
     query = query.eq('service_date', date);
   }

   const { data: appointments, error: appointmentsError } = await query;

   if (appointmentsError) {
     console.error('Get artist appointments error:', appointmentsError);
     return res.status(500).json({ error: 'Failed to fetch appointments' });
   }

   // 整理回傳格式
   const formattedAppointments = appointments.map(apt => ({
     id: apt.id,
     customerId: apt.customers.user_id,
     customerName: apt.customers.user_name,
     date: apt.service_date,
     time: apt.service_time,
     status: apt.status,
     note: apt.note,
     createdAt: apt.created_at
   }));

   res.json({
     success: true,
     artistId,
     artistName: artist.studio_name,
     appointments: formattedAppointments,
     total: formattedAppointments.length
   });
   
 } catch (error) {
   console.error('Get artist appointments error:', error);
   res.status(500).json({ error: 'Internal server error' });
 }
});

// GET /api/reservations/customer/:customerId
// 獲取顧客的所有預約
router.get('/customer/:customerId', async (req, res) => {
 try {
   const { customerId } = req.params;
   const { status } = req.query; // 可選的篩選條件
   
   const supabase = req.supabase;
   
   // 驗證顧客存在
   const { data: customer, error: customerError } = await supabase
     .from('customers')
     .select('user_id, user_name')
     .eq('user_id', customerId)
     .single();
     
   if (customerError || !customer) {
     return res.status(404).json({ error: 'Customer not found' });
   }

   // 建立查詢
   let query = supabase
     .from('appointments')
     .select(`
       id,
       service_date,
       service_time,
       status,
       note,
       created_at,
       artists!inner(user_id, studio_name)
     `)
     .eq('customer_id', customerId)
     .order('service_date', { ascending: false })
     .order('service_time', { ascending: true });

   // 加入篩選條件
   if (status) {
     query = query.eq('status', status);
   }

   const { data: appointments, error: appointmentsError } = await query;

   if (appointmentsError) {
     console.error('Get customer appointments error:', appointmentsError);
     return res.status(500).json({ error: 'Failed to fetch appointments' });
   }

   // 整理回傳格式
   const formattedAppointments = appointments.map(apt => ({
     id: apt.id,
     artistId: apt.artists.user_id,
     artistName: apt.artists.studio_name,
     date: apt.service_date,
     time: apt.service_time,
     status: apt.status,
     note: apt.note,
     createdAt: apt.created_at
   }));

   res.json({
     success: true,
     customerId,
     customerName: customer.user_name,
     appointments: formattedAppointments,
     total: formattedAppointments.length
   });
   
 } catch (error) {
   console.error('Get customer appointments error:', error);
   res.status(500).json({ error: 'Internal server error' });
 }
});

// PUT /api/reservations/:appointmentId/status
// 更新預約狀態（確認/取消/完成）
router.put('/:appointmentId/status', async (req, res) => {
 try {
   const { appointmentId } = req.params;
   const { status, reason } = req.body; // reason 是取消原因（可選）
   
   if (!status) {
     return res.status(400).json({ error: 'Status is required' });
   }

   const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
   if (!validStatuses.includes(status)) {
     return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
   }

   const supabase = req.supabase;
   
   // 檢查預約是否存在
   const { data: appointment, error: appointmentError } = await supabase
     .from('appointments')
     .select(`
       id,
       status,
       service_date,
       service_time,
       customers!inner(user_name),
       artists!inner(studio_name)
     `)
     .eq('id', appointmentId)
     .single();
     
   if (appointmentError || !appointment) {
     return res.status(404).json({ error: 'Appointment not found' });
   }

   // 檢查狀態轉換是否合理
   const currentStatus = appointment.status;
   if (currentStatus === 'completed' && status !== 'completed') {
     return res.status(400).json({ error: 'Cannot change status of completed appointment' });
   }

   if (currentStatus === 'cancelled' && status !== 'cancelled') {
     return res.status(400).json({ error: 'Cannot change status of cancelled appointment' });
   }

   // 更新預約狀態
   const updateData = {
     status,
     updated_at: new Date().toISOString()
   };

   if (status === 'cancelled' && reason) {
     updateData.cancellation_reason = reason;
   }

   const { error: updateError } = await supabase
     .from('appointments')
     .update(updateData)
     .eq('id', appointmentId);

   if (updateError) {
     console.error('Update appointment status error:', updateError);
     return res.status(500).json({ error: 'Failed to update appointment status' });
   }

   res.json({
     success: true,
     message: `Appointment ${status} successfully`,
     appointment: {
       id: appointmentId,
       customerName: appointment.customers.user_name,
       artistName: appointment.artists.studio_name,
       date: appointment.service_date,
       time: appointment.service_time,
       oldStatus: currentStatus,
       newStatus: status,
       reason: reason || null
     }
   });
   
 } catch (error) {
   console.error('Update appointment status error:', error);
   res.status(500).json({ error: 'Internal server error' });
 }
});

module.exports = router;