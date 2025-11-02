// اختبار تسجيل الدخول في Backend
const axios = require('axios');

const API_URL = 'http://localhost:3000/v1';

async function testBackend() {
  console.log('🧪 اختبار Backend وتسجيل الدخول...\n');

  // 1. اختبار Health Check
  try {
    console.log('1️⃣ اختبار Health Check...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check نجح:', health.data);
    console.log('');
  } catch (error) {
    console.error('❌ Health Check فشل:', error.message);
    console.error('   تأكد من أن Backend يعمل على http://localhost:3000');
    return;
  }

  // 2. اختبار Login Endpoint
  try {
    console.log('2️⃣ اختبار تسجيل الدخول...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@clinic.com',
      password: 'password123'
    });

    console.log('✅ تسجيل الدخول نجح!');
    console.log('📦 Response Status:', loginResponse.status);
    console.log('📋 Response Data:');
    console.log('   - Token:', loginResponse.data.data.access_token.substring(0, 30) + '...');
    console.log('   - User:', loginResponse.data.data.user);
    console.log('');
    
    // 3. اختبار استخدام Token
    const token = loginResponse.data.data.access_token;
    console.log('3️⃣ اختبار استخدام Token...');
    
    try {
      const meResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ استخدام Token نجح!');
      console.log('📋 User Info:', meResponse.data);
    } catch (error) {
      console.error('❌ استخدام Token فشل:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ تسجيل الدخول فشل!');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.message || error.response.statusText);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   لا يوجد استجابة من الخادم');
      console.error('   تأكد من أن Backend يعمل على http://localhost:3000');
    } else {
      console.error('   Error:', error.message);
    }
    
    console.log('');
    console.log('💡 الحلول المحتملة:');
    console.log('   1. تأكد من أن Backend يعمل: npm run start:dev');
    console.log('   2. تحقق من أن MongoDB يعمل');
    console.log('   3. تأكد من وجود مستخدم admin@clinic.com في MongoDB');
    console.log('   4. شغّل seed script: npm run seed');
  }
}

// تشغيل الاختبار
testBackend().catch(console.error);



