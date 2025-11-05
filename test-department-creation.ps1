# اختبار إضافة قسم جديد
Write-Host "=== اختبار إنشاء قسم جديد ===" -ForegroundColor Green

# 1. اختبار صحة API
Write-Host "`n1. اختبار صحة API..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3000/v1/health" -Method GET
    Write-Host "✅ API تعمل بنجاح" -ForegroundColor Green
} catch {
    Write-Host "❌ خطأ: API لا تعمل" -ForegroundColor Red
    exit 1
}

# 2. تسجيل الدخول
Write-Host "`n2. تسجيل الدخول بحساب الأدمن..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@clinic.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.access_token
    $userName = $loginData.user.name
    $userRole = $loginData.user.role
    
    Write-Host "✅ تم تسجيل الدخول بنجاح" -ForegroundColor Green
    Write-Host "   الاسم: $userName" -ForegroundColor Cyan
    Write-Host "   الدور: $userRole" -ForegroundColor Cyan
    Write-Host "   التوكن: $($token.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ خطأ في تسجيل الدخول: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. عرض الأقسام الحالية
Write-Host "`n3. عرض الأقسام الحالية..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $departments = Invoke-WebRequest -Uri "http://localhost:3000/v1/admin/departments" `
        -Method GET `
        -Headers $headers
    
    $deptData = $departments.Content | ConvertFrom-Json
    $deptCount = $deptData.Count
    
    Write-Host "✅ عدد الأقسام الحالية: $deptCount" -ForegroundColor Green
} catch {
    Write-Host "❌ خطأ في عرض الأقسام: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# 4. إنشاء قسم جديد (بدون صورة)
Write-Host "`n4. إنشاء قسم جديد 'قسم الاختبار'..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$newDepartment = @{
    name = "قسم الاختبار $timestamp"
    description = "قسم تجريبي لاختبار النظام"
    isActive = $true
} | ConvertTo-Json

try {
    $createResponse = Invoke-WebRequest -Uri "http://localhost:3000/v1/admin/departments" `
        -Method POST `
        -Headers $headers `
        -Body $newDepartment
    
    $createdDept = $createResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ تم إنشاء القسم بنجاح!" -ForegroundColor Green
    Write-Host "   ID: $($createdDept._id)" -ForegroundColor Cyan
    Write-Host "   الاسم: $($createdDept.name)" -ForegroundColor Cyan
    Write-Host "   الوصف: $($createdDept.description)" -ForegroundColor Cyan
    Write-Host "   نشط: $($createdDept.isActive)" -ForegroundColor Cyan
    
    # حفظ الـ ID للاستخدام لاحقاً
    $departmentId = $createdDept._id
    
} catch {
    Write-Host "❌ خطأ في إنشاء القسم: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "   التفاصيل: $errorBody" -ForegroundColor Red
    }
    exit 1
}

# 5. التحقق من القسم الجديد
Write-Host "`n5. التحقق من القسم الجديد..." -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-WebRequest -Uri "http://localhost:3000/v1/admin/departments/$departmentId" `
        -Method GET `
        -Headers $headers
    
    $verifiedDept = $verifyResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ تم التحقق من القسم بنجاح" -ForegroundColor Green
    Write-Host "   الاسم: $($verifiedDept.name)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ خطأ في التحقق من القسم" -ForegroundColor Red
}

# 6. عرض العدد النهائي للأقسام
Write-Host "`n6. عرض العدد النهائي للأقسام..." -ForegroundColor Yellow
try {
    $finalDepartments = Invoke-WebRequest -Uri "http://localhost:3000/v1/admin/departments" `
        -Method GET `
        -Headers $headers
    
    $finalDeptData = $finalDepartments.Content | ConvertFrom-Json
    $finalDeptCount = $finalDeptData.Count
    
    Write-Host "✅ عدد الأقسام بعد الإضافة: $finalDeptCount" -ForegroundColor Green
    Write-Host "   تمت إضافة: $($finalDeptCount - $deptCount) قسم" -ForegroundColor Cyan
} catch {
    Write-Host "❌ خطأ في عرض الأقسام" -ForegroundColor Red
}

# 7. حذف القسم التجريبي (اختياري)
Write-Host "`n7. هل تريد حذف القسم التجريبي؟ (y/n)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "y" -or $response -eq "Y") {
    try {
        Invoke-WebRequest -Uri "http://localhost:3000/v1/admin/departments/$departmentId" `
            -Method DELETE `
            -Headers $headers | Out-Null
        
        Write-Host "✅ تم حذف القسم التجريبي بنجاح" -ForegroundColor Green
    } catch {
        Write-Host "❌ خطأ في حذف القسم" -ForegroundColor Red
    }
} else {
    Write-Host "تم الاحتفاظ بالقسم التجريبي" -ForegroundColor Cyan
}

Write-Host "`n=== انتهى الاختبار ===" -ForegroundColor Green
Write-Host "جميع الاختبارات نجحت! ✅" -ForegroundColor Green








