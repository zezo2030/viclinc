// سكريبت لتحديث إعدادات Agora باستخدام توكن الأدمن
const axios = require('axios');
const readline = require('readline');

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
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function getAdminToken() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    let token;
    if (response.data?.access_token) {
      token = response.data.access_token;
    } else if (response.data?.data?.access_token) {
      token = response.data.data.access_token;
    } else {
      throw new Error('لم يتم العثور على token في الاستجابة');
    }

    return token;
  } catch (error) {
    log('❌ فشل تسجيل الدخول!', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${JSON.stringify(error.response.data)}`, 'red');
    }
    throw error;
  }
}

async function getCurrentSettings(token) {
  try {
    const response = await axios.get(`${API_URL}/admin/settings/agora`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    log('❌ فشل الحصول على الإعدادات الحالية!', 'red');
    throw error;
  }
}

async function updateSettings(token, settings) {
  try {
    const response = await axios.patch(`${API_URL}/admin/settings/agora`, settings, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    log('❌ فشل تحديث الإعدادات!', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${JSON.stringify(error.response.data)}`, 'red');
    }
    throw error;
  }
}

async function testConnection(token) {
  try {
    const response = await axios.post(`${API_URL}/admin/settings/agora/test`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
}

async function main() {
  console.log('\n');
  log('⚙️  تحديث إعدادات Agora', 'bright');
  log(`🌐 API URL: ${API_URL}`, 'cyan');

  try {
    // 1. تسجيل الدخول
    logSection('🔐 تسجيل الدخول كأدمن');
    log('جاري تسجيل الدخول...', 'cyan');
    const token = await getAdminToken();
    log('✅ تم تسجيل الدخول بنجاح!', 'green');

    // 2. الحصول على الإعدادات الحالية
    logSection('📋 الإعدادات الحالية');
    const currentSettings = await getCurrentSettings(token);
    
    log('الإعدادات الحالية:', 'cyan');
    log(`   - App ID: ${currentSettings.appId || 'غير محدد'}`, 
        currentSettings.appId ? 'green' : 'yellow');
    log(`   - App Certificate: ${currentSettings.appCertificate || 'غير محدد'}`, 
        currentSettings.appCertificate ? 'green' : 'yellow');
    log(`   - Token Expiration: ${currentSettings.tokenExpirationTime || 3600} ثانية`);
    log(`   - مفعّل: ${currentSettings.isEnabled ? '✅ نعم' : '❌ لا'}`,
        currentSettings.isEnabled ? 'green' : 'yellow');

    // 3. طلب البيانات من المستخدم
    logSection('📝 إدخال بيانات Agora الجديدة');
    log('أدخل بيانات Agora (اضغط Enter للاحتفاظ بالقيمة الحالية):', 'cyan');
    
    const appId = await question(`App ID [${currentSettings.appId || 'فارغ'}]: `);
    const appCertificate = await question(`App Certificate [${currentSettings.appCertificate ? '***' + currentSettings.appCertificate.slice(-4) : 'فارغ'}]: `);
    const tokenExpiration = await question(`Token Expiration Time (بالثواني) [${currentSettings.tokenExpirationTime || 3600}]: `);
    const isEnabled = await question(`مفعّل (true/false) [${currentSettings.isEnabled}]: `);

    // إعداد البيانات للتحديث
    const updateData = {};
    
    if (appId.trim() && appId.trim() !== (currentSettings.appId || '')) {
      updateData.appId = appId.trim();
    } else if (currentSettings.appId) {
      updateData.appId = currentSettings.appId;
    }

    if (appCertificate.trim()) {
      updateData.appCertificate = appCertificate.trim();
    } else if (currentSettings.appCertificate && !currentSettings.appCertificate.startsWith('***')) {
      // إذا كان موجود في الإعدادات الحالية، نحتفظ به
      log('⚠️  سيتم الاحتفاظ بـ App Certificate الحالي', 'yellow');
    }

    if (tokenExpiration.trim()) {
      const expiration = parseInt(tokenExpiration.trim(), 10);
      if (!isNaN(expiration) && expiration > 0) {
        updateData.tokenExpirationTime = expiration;
      }
    } else {
      updateData.tokenExpirationTime = currentSettings.tokenExpirationTime || 3600;
    }

    if (isEnabled.trim()) {
      updateData.isEnabled = isEnabled.trim().toLowerCase() === 'true';
    } else {
      updateData.isEnabled = currentSettings.isEnabled !== undefined ? currentSettings.isEnabled : true;
    }

    // التحقق من البيانات المطلوبة
    if (updateData.isEnabled && (!updateData.appId && !currentSettings.appId)) {
      log('❌ خطأ: App ID مطلوب عند تفعيل Agora!', 'red');
      rl.close();
      return;
    }

    if (updateData.isEnabled && !appCertificate.trim() && !currentSettings.appCertificate) {
      log('❌ خطأ: App Certificate مطلوب عند تفعيل Agora!', 'red');
      log('💡 نصيحة: إذا كان App Certificate موجود في Environment Variables، يمكنك تركه فارغاً', 'cyan');
      rl.close();
      return;
    }

    // 4. تحديث الإعدادات
    logSection('💾 تحديث الإعدادات');
    log('جاري تحديث الإعدادات...', 'cyan');
    
    const updatedSettings = await updateSettings(token, updateData);
    
    log('✅ تم تحديث الإعدادات بنجاح!', 'green');
    log('\nالإعدادات المحدثة:', 'cyan');
    log(`   - App ID: ${updatedSettings.appId || 'غير محدد'}`);
    log(`   - App Certificate: ${updatedSettings.appCertificate || 'مخفي'}`);
    log(`   - Token Expiration: ${updatedSettings.tokenExpirationTime} ثانية`);
    log(`   - مفعّل: ${updatedSettings.isEnabled ? '✅ نعم' : '❌ لا'}`);

    // 5. اختبار الاتصال
    logSection('🧪 اختبار الاتصال');
    log('جاري اختبار الاتصال...', 'cyan');
    
    const testResult = await testConnection(token);
    
    if (testResult.success) {
      log('✅ اختبار الاتصال نجح!', 'green');
      log(`   Message: ${testResult.message}`, 'green');
    } else {
      log('❌ اختبار الاتصال فشل!', 'red');
      log(`   Message: ${testResult.message}`, 'red');
      log('\n💡 نصائح:', 'yellow');
      log('   - تأكد من صحة App ID و App Certificate');
      log('   - تحقق من أن App Certificate تم تفعيله في Agora Console');
      log('   - تأكد من أن ENCRYPTION_KEY موجود في Environment Variables');
    }

    logSection('✅ الانتهاء');
    log('تم تنفيذ العملية بنجاح!', 'green');

  } catch (error) {
    logSection('❌ خطأ');
    log('حدث خطأ أثناء تنفيذ العملية:', 'red');
    log(error.message, 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Data: ${JSON.stringify(error.response.data)}`, 'red');
    }
  } finally {
    rl.close();
  }
}

// تشغيل السكريبت
main().catch(error => {
  console.error('خطأ غير متوقع:', error);
  rl.close();
  process.exit(1);
});





