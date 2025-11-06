// اختبار تسجيل الدخول وفحص إعدادات Agora
const axios = require('axios');

// إعدادات API
const API_URL = process.env.API_URL || 'http://localhost:3000/v1';
const ADMIN_EMAIL = 'admin@clinic.com';
const ADMIN_PASSWORD = 'password123';

// ألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

async function testAdminLogin() {
  logSection('🔐 اختبار تسجيل الدخول كأدمن');
  
  try {
    log(`📡 إرسال طلب تسجيل الدخول إلى: ${API_URL}/auth/login`, 'cyan');
    log(`📧 البريد الإلكتروني: ${ADMIN_EMAIL}`, 'cyan');
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    log('✅ تسجيل الدخول نجح!', 'green');
    
    // التحقق من بنية الاستجابة
    let token, user;
    if (loginResponse.data?.access_token && loginResponse.data?.user) {
      token = loginResponse.data.access_token;
      user = loginResponse.data.user;
    } else if (loginResponse.data?.data?.access_token && loginResponse.data?.data?.user) {
      token = loginResponse.data.data.access_token;
      user = loginResponse.data.data.user;
    } else {
      throw new Error('استجابة غير صحيحة: لم يتم العثور على token أو user');
    }

    log(`\n📋 معلومات المستخدم:`, 'cyan');
    log(`   - ID: ${user.id}`);
    log(`   - الاسم: ${user.name || 'غير متوفر'}`);
    log(`   - البريد: ${user.email}`);
    log(`   - الدور: ${user.role}`);
    log(`\n🔑 Token: ${token.substring(0, 30)}...`, 'yellow');
    
    return { token, user };
  } catch (error) {
    log('❌ تسجيل الدخول فشل!', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${JSON.stringify(error.response.data)}`, 'red');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
    throw error;
  }
}

async function getAgoraSettings(token) {
  logSection('⚙️  الحصول على إعدادات Agora الحالية');
  
  try {
    log(`📡 إرسال طلب GET إلى: ${API_URL}/admin/settings/agora`, 'cyan');
    
    const response = await axios.get(`${API_URL}/admin/settings/agora`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    log('✅ تم الحصول على إعدادات Agora بنجاح!', 'green');
    
    const settings = response.data;
    
    log(`\n📋 إعدادات Agora الحالية:`, 'cyan');
    log(`   - App ID: ${settings.appId || 'غير محدد'}`);
    log(`   - App Certificate: ${settings.appCertificate || 'غير محدد'}`);
    log(`   - Token Expiration Time: ${settings.tokenExpirationTime || 3600} ثانية`);
    log(`   - مفعّل: ${settings.isEnabled ? '✅ نعم' : '❌ لا'}`);
    log(`   - آخر تحديث: ${settings.updatedAt || 'غير متوفر'}`);
    log(`   - آخر من حدّث: ${settings.updatedBy || 'غير متوفر'}`);
    
    return settings;
  } catch (error) {
    log('❌ فشل الحصول على إعدادات Agora!', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${JSON.stringify(error.response.data)}`, 'red');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
    throw error;
  }
}

async function testAgoraConnection(token) {
  logSection('🧪 اختبار اتصال Agora');
  
  try {
    log(`📡 إرسال طلب POST إلى: ${API_URL}/admin/settings/agora/test`, 'cyan');
    
    const response = await axios.post(`${API_URL}/admin/settings/agora/test`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = response.data;
    
    if (result.success) {
      log('✅ اختبار اتصال Agora نجح!', 'green');
      log(`   Message: ${result.message}`, 'green');
      log(`   Timestamp: ${result.timestamp}`, 'green');
    } else {
      log('❌ اختبار اتصال Agora فشل!', 'red');
      log(`   Message: ${result.message}`, 'red');
      log(`   Timestamp: ${result.timestamp}`, 'red');
    }
    
    return result;
  } catch (error) {
    log('❌ فشل اختبار اتصال Agora!', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${JSON.stringify(error.response.data)}`, 'red');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
    throw error;
  }
}

async function getVideoAppId() {
  logSection('📱 الحصول على App ID (Endpoint عام)');
  
  try {
    log(`📡 إرسال طلب GET إلى: ${API_URL}/sessions/video/app-id`, 'cyan');
    
    const response = await axios.get(`${API_URL}/sessions/video/app-id`);
    
    log('✅ تم الحصول على App ID بنجاح!', 'green');
    log(`\n📋 معلومات App ID:`, 'cyan');
    log(`   - App ID: ${response.data.appId || 'غير متوفر'}`);
    log(`   - مفعّل: ${response.data.isEnabled ? '✅ نعم' : '❌ لا'}`);
    
    return response.data;
  } catch (error) {
    log('❌ فشل الحصول على App ID!', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${JSON.stringify(error.response.data)}`, 'red');
    } else {
      log(`   Error: ${error.message}`, 'red');
    }
    throw error;
  }
}

async function main() {
  console.log('\n');
  log('🚀 بدء اختبار Agora وإعدادات النظام', 'bright');
  log(`🌐 API URL: ${API_URL}`, 'cyan');
  
  try {
    // 1. تسجيل الدخول
    const { token, user } = await testAdminLogin();
    
    // 2. الحصول على إعدادات Agora
    const settings = await getAgoraSettings(token);
    
    // 3. اختبار اتصال Agora
    await testAgoraConnection(token);
    
    // 4. الحصول على App ID (Endpoint عام)
    await getVideoAppId();
    
    // ملخص
    logSection('📊 الملخص');
    log('✅ تم تنفيذ جميع الاختبارات بنجاح!', 'green');
    log(`\n🔑 Admin Token: ${token.substring(0, 50)}...`, 'yellow');
    log(`\n💡 نصيحة:`, 'cyan');
    log('   - يمكنك استخدام هذا Token للوصول إلى API');
    log('   - استخدم Authorization header: Bearer <token>');
    
    if (!settings.isEnabled || !settings.appId) {
      log('\n⚠️  تحذير:', 'yellow');
      log('   - Agora غير مفعّل أو App ID غير محدد');
      log('   - يرجى إعداد Agora من Admin Dashboard أو ملف .env');
    }
    
  } catch (error) {
    logSection('❌ فشل الاختبار');
    log('فشل في تنفيذ الاختبارات. يرجى التحقق من:', 'red');
    log('   1. الباك اند يعمل على المنفذ الصحيح', 'red');
    log('   2. بيانات تسجيل الدخول صحيحة', 'red');
    log('   3. الاتصال بقاعدة البيانات يعمل', 'red');
    process.exit(1);
  }
}

// تشغيل الاختبار
main().catch(error => {
  console.error('خطأ غير متوقع:', error);
  process.exit(1);
});



