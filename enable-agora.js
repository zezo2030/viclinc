// سكريبت بسيط لتفعيل Agora
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/v1';
const ADMIN_EMAIL = 'admin@clinic.com';
const ADMIN_PASSWORD = 'password123';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  try {
    // 1. تسجيل الدخول
    log('🔐 تسجيل الدخول...', 'cyan');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const token = loginRes.data?.access_token || loginRes.data?.data?.access_token;
    if (!token) {
      throw new Error('فشل الحصول على token');
    }
    log('✅ تم تسجيل الدخول', 'green');

    // 2. الحصول على الإعدادات الحالية
    log('\n📋 الحصول على الإعدادات الحالية...', 'cyan');
    const settingsRes = await axios.get(`${API_URL}/admin/settings/agora`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const currentSettings = settingsRes.data;
    log(`   - App ID: ${currentSettings.appId || 'غير محدد'}`);
    log(`   - App Certificate: ${currentSettings.appCertificate ? 'موجود' : 'غير محدد'}`);
    log(`   - مفعّل: ${currentSettings.isEnabled ? '✅ نعم' : '❌ لا'}`);

    // 3. تفعيل Agora
    if (!currentSettings.isEnabled) {
      log('\n⚙️  تفعيل Agora...', 'cyan');
      const updateData = {
        isEnabled: true
      };

      // إذا كان App ID موجود، نضمن إرساله
      if (currentSettings.appId) {
        updateData.appId = currentSettings.appId;
      }

      // إذا كان Token Expiration موجود، نضمن إرساله
      if (currentSettings.tokenExpirationTime) {
        updateData.tokenExpirationTime = currentSettings.tokenExpirationTime;
      }

      const updateRes = await axios.patch(`${API_URL}/admin/settings/agora`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      log('✅ تم تفعيل Agora بنجاح!', 'green');
      log(`   - App ID: ${updateRes.data.appId}`);
      log(`   - مفعّل: ${updateRes.data.isEnabled ? '✅ نعم' : '❌ لا'}`);

      // 4. اختبار الاتصال
      log('\n🧪 اختبار الاتصال...', 'cyan');
      const testRes = await axios.post(`${API_URL}/admin/settings/agora/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (testRes.data.success) {
        log('✅ اختبار الاتصال نجح!', 'green');
        log(`   Message: ${testRes.data.message}`, 'green');
      } else {
        log('❌ اختبار الاتصال فشل!', 'red');
        log(`   Message: ${testRes.data.message}`, 'red');
      }

    } else {
      log('\n✅ Agora مفعّل بالفعل!', 'green');

      // اختبار الاتصال
      log('\n🧪 اختبار الاتصال...', 'cyan');
      const testRes = await axios.post(`${API_URL}/admin/settings/agora/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (testRes.data.success) {
        log('✅ اختبار الاتصال نجح!', 'green');
      } else {
        log('❌ اختبار الاتصال فشل!', 'red');
        log(`   Message: ${testRes.data.message}`, 'red');
      }
    }

  } catch (error) {
    log('\n❌ خطأ:', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${JSON.stringify(error.response.data)}`, 'red');
    } else {
      log(`   ${error.message}`, 'red');
    }
    process.exit(1);
  }
}

main();



