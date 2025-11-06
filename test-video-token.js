// اختبار الحصول على Video Token (مثل ما يفعله التطبيق)
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

    // 1. الحصول على App ID (مثل ما يفعله التطبيق)
    log('\n📱 الحصول على App ID...', 'cyan');
    try {
      const appIdRes = await axios.get(`${API_URL}/sessions/video/app-id`);
      log('✅ تم الحصول على App ID', 'green');
      log(`   App ID: ${appIdRes.data.appId}`);
      log(`   isEnabled: ${appIdRes.data.isEnabled}`);
    } catch (error) {
      log('❌ فشل الحصول على App ID', 'red');
      if (error.response) {
        log(`   Status: ${error.response.status}`, 'red');
        log(`   Message: ${JSON.stringify(error.response.data)}`, 'red');
      }
      throw error;
    }

    // 2. محاولة الحصول على Video Token (يحتاج appointmentId حقيقي)
    log('\n🎬 ملاحظة: للحصول على Video Token، تحتاج إلى:', 'yellow');
    log('   1. appointmentId حقيقي');
    log('   2. الموعد يجب أن يكون CONFIRMED');
    log('   3. الوقت يجب أن يكون ضمن 10 دقائق قبل الموعد');
    log('   4. المستخدم يجب أن يكون الطبيب أو المريض للموعد');
    
    log('\n💡 إذا كان لديك appointmentId، يمكنك اختباره:', 'cyan');
    log('   node test-video-token.js <appointmentId> <role>', 'cyan');
    log('   مثال: node test-video-token.js 64f1a2b3c4d5e6f7g8h9i0j1 patient', 'cyan');

    // إذا تم تمرير appointmentId كمعامل
    const appointmentId = process.argv[2];
    const role = process.argv[3] || 'patient';

    if (appointmentId) {
      log(`\n🎬 طلب Video Token للموعد: ${appointmentId}`, 'cyan');
      log(`   Role: ${role}`, 'cyan');
      
      try {
        const tokenRes = await axios.post(
          `${API_URL}/sessions/video/token`,
          {
            appointmentId: appointmentId,
            role: role
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        log('✅ تم الحصول على Video Token بنجاح!', 'green');
        log(`   Token: ${tokenRes.data.token.substring(0, 50)}...`, 'yellow');
        log(`   Channel Name: ${tokenRes.data.channelName}`);
        log(`   UID: ${tokenRes.data.uid}`);
        log(`   App ID: ${tokenRes.data.appId}`);
        log(`   Expiration Time: ${tokenRes.data.expirationTime} ثانية`);
        log(`   Session Status: ${tokenRes.data.sessionStatus}`);
        log(`   Can Join: ${tokenRes.data.canJoin}`);
      } catch (error) {
        log('❌ فشل الحصول على Video Token', 'red');
        if (error.response) {
          log(`   Status: ${error.response.status}`, 'red');
          log(`   Message: ${JSON.stringify(error.response.data)}`, 'red');
        } else {
          log(`   Error: ${error.message}`, 'red');
        }
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



