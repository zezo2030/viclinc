# تقرير شامل: فلو حجز الموعد في الويبسايت

## نظرة عامة
هذا التقرير يوضح الفلو الكامل لعملية حجز الموعد في الويبسايت من البداية حتى النهاية.

---

## 📋 الفهرس
1. [نقطة البداية](#نقطة-البداية)
2. [الخطوات التفصيلية](#الخطوات-التفصيلية)
3. [الواجهة الأمامية (Frontend)](#الواجهة-الأمامية)
4. [API Layer](#api-layer)
5. [الخلفية (Backend)](#الخلفية)
6. [قاعدة البيانات](#قاعدة-البيانات)
7. [الإشعارات](#الإشعارات)
8. [نقاط التحقق والأمان](#نقاط-التحقق-والأمان)
9. [مخطط الفلو](#مخطط-الفلو)

---

## 🚀 نقطة البداية

**الصفحة:** `/appointments/new`  
**المكون:** `viclinc/websit/src/app/appointments/new/page.tsx`  
**الحماية:** `ProtectedRoute` - يتطلب تسجيل الدخول كـ `PATIENT`

---

## 📝 الخطوات التفصيلية

### المرحلة 1: تحميل البيانات الأولية

#### 1.1 جلب الطبيب (إذا كان محدداً في URL)
```typescript
// إذا كان doctorId موجود في query parameters
GET /patient/doctors/:doctorId
أو
GET /doctors/public/:doctorId
```

**الكود:**
```44:54:viclinc/websit/src/app/appointments/new/page.tsx
  // جلب بيانات الطبيب المحدد مباشرة إذا كان doctorId موجود
  const { data: doctorData, isLoading: doctorLoading } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => {
      if (doctorId) {
        return doctorsService.getDoctor(doctorId);
      }
      return null;
    },
    enabled: !!doctorId, // فقط إذا كان doctorId موجود
  });
```

#### 1.2 جلب قائمة الأطباء (إذا لم يكن الطبيب محدداً)
```typescript
GET /patient/doctors
أو
GET /doctors/public
```

**الكود:**
```57:61:viclinc/websit/src/app/appointments/new/page.tsx
  // جلب الأطباء فقط إذا لم يكن doctorId موجود (للاختيار الحر)
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors', specialtyId],
    queryFn: () => doctorsService.getDoctors(),
    enabled: !doctorId, // فقط إذا لم يكن doctorId موجود
  });
```

#### 1.3 اختيار نوع الموعد
المستخدم يختار نوع الموعد:
- `IN_PERSON` - حجز عيادة (موعد شخصي)
- `VIDEO` - استشارة فيديو
- `CHAT` - استشارة نصية

**الكود:**
```186:228:viclinc/websit/src/app/appointments/new/page.tsx
          {/* Appointment Type Selection */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setAppointmentType('IN_PERSON')}
              className={`p-4 rounded-xl border-2 transition-all ${
                appointmentType === 'IN_PERSON'
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className={`w-6 h-6 mx-auto mb-2 ${appointmentType === 'IN_PERSON' ? 'text-primary-600' : 'text-gray-400'}`} />
              <div className="font-semibold text-gray-900">حجز عيادة</div>
              <div className="text-sm text-gray-600">موعد شخصي في العيادة</div>
            </button>
            <button
              onClick={() => setAppointmentType('VIDEO')}
              className={`p-4 rounded-xl border-2 transition-all ${
                appointmentType === 'VIDEO'
                  ? 'border-secondary-500 bg-secondary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className={`w-6 h-6 mx-auto mb-2 ${appointmentType === 'VIDEO' ? 'text-secondary-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div className="font-semibold text-gray-900">استشارة فيديو</div>
              <div className="text-sm text-gray-600">استشارة مباشرة عبر الفيديو</div>
            </button>
            <button
              onClick={() => setAppointmentType('CHAT')}
              className={`p-4 rounded-xl border-2 transition-all ${
                appointmentType === 'CHAT'
                  ? 'border-primary-400 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className={`w-6 h-6 mx-auto mb-2 ${appointmentType === 'CHAT' ? 'text-primary-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <div className="font-semibold text-gray-900">استشارة نصية</div>
              <div className="text-sm text-gray-600">محادثة نصية مع الطبيب</div>
            </button>
          </div>
```

---

### المرحلة 2: اختيار الطبيب والخدمة

#### 2.1 اختيار الطبيب
بعد اختيار الطبيب، يتم جلب الخدمات المتاحة له:

**الكود:**
```74:79:viclinc/websit/src/app/appointments/new/page.tsx
  // جلب الخدمات المتاحة
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', selectedDoctor?.departmentId || selectedDoctor?.department?.id],
    queryFn: () => servicesApi.getAll(selectedDoctor?.departmentId || selectedDoctor?.department?.id),
    enabled: !!selectedDoctor,
  });
```

**API Call:**
```typescript
GET /services?departmentId={departmentId}
```

#### 2.2 اختيار الخدمة
بعد اختيار الخدمة، يتم جلب التوفر (Availability):

**الكود:**
```82:92:viclinc/websit/src/app/appointments/new/page.tsx
  // جلب التوفر عند اختيار الطبيب والخدمة
  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['availability', selectedDoctor?._id || selectedDoctor?.id, selectedService?._id || selectedService?.id, weekStart],
    queryFn: () => {
      if (!selectedDoctor || !selectedService) return null;
      const doctorIdValue = selectedDoctor._id || selectedDoctor.id;
      const serviceIdValue = selectedService._id || selectedService.id;
      if (!doctorIdValue || !serviceIdValue) return null;
      return doctorsService.getDoctorAvailability(doctorIdValue, serviceIdValue, weekStart);
    },
    enabled: !!selectedDoctor && !!selectedService && !!(selectedDoctor._id || selectedDoctor.id) && !!(selectedService._id || selectedService.id),
  });
```

**API Call:**
```typescript
GET /patient/doctors/:doctorId/availability?serviceId={serviceId}&weekStart={weekStart}
```

---

### المرحلة 3: جلب التوفر (Availability)

#### 3.1 Backend: Availability Service

**Endpoint:** `GET /patient/doctors/:id/availability`

**Controller:**
```39:55:viclinc/clinic-api/src/modules/patients/patients.controller.ts
  @Get('doctors/:id/availability')
  @ApiOperation({ summary: 'Get doctor availability for appointments' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiQuery({ name: 'serviceId', required: true, description: 'Service ID' })
  @ApiQuery({ name: 'weekStart', required: false, description: 'Week start date (optional)' })
  @ApiResponse({ status: 200, description: 'Doctor availability retrieved successfully' })
  getDoctorAvailability(
    @Param('id') doctorId: string,
    @Query('serviceId') serviceId: string,
    @Query('weekStart') weekStart?: string,
  ) {
    if (!serviceId) {
      throw new Error('serviceId is required');
    }
    
    return this.patientsService.getDoctorAvailability(doctorId, serviceId, weekStart);
  }
```

**Service Logic:**
1. التحقق من وجود الطبيب والخدمة
2. التحقق من أن الطبيب يقدم هذه الخدمة
3. جلب جدول الطبيب (DoctorSchedule)
4. حساب الفتحات المتاحة بناءً على:
   - جدول الطبيب (working hours)
   - المواعيد المحجوزة مسبقاً
   - مدة الخدمة
   - أيام الإجازات

**Response Format:**
```typescript
{
  doctorId: string;
  serviceId: string;
  weekStart: string; // ISO string
  availableSlots: Array<{
    startTime: string; // ISO string
    endTime: string; // ISO string
    duration: number; // minutes
  }>;
}
```

---

### المرحلة 4: اختيار التاريخ والوقت

#### 4.1 عرض التواريخ المتاحة
يتم استخراج التواريخ الفريدة من الفتحات المتاحة:

**الكود:**
```95:103:viclinc/websit/src/app/appointments/new/page.tsx
  // استخراج التواريخ المتاحة من الفتحات
  const availableDates = React.useMemo(() => {
    if (!availability?.availableSlots) return [];
    const datesSet = new Set<string>();
    availability.availableSlots.forEach((slot) => {
      const date = new Date(slot.startTime).toISOString().split('T')[0];
      datesSet.add(date);
    });
    return Array.from(datesSet).sort();
  }, [availability]);
```

#### 4.2 عرض الفتحات المتاحة للتاريخ المحدد
بعد اختيار التاريخ، يتم عرض الفتحات المتاحة لذلك اليوم:

**الكود:**
```106:114:viclinc/websit/src/app/appointments/new/page.tsx
  // الحصول على الفتحات المتاحة لتاريخ محدد
  const getSlotsForDate = (date: string) => {
    if (!availability?.availableSlots) return [];
    return availability.availableSlots
      .filter((slot) => {
        const slotDate = new Date(slot.startTime).toISOString().split('T')[0];
        return slotDate === date;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };
```

#### 4.3 اختيار الفتحة الزمنية
المستخدم يختار فتحة زمنية محددة:

**الكود:**
```447:470:viclinc/websit/src/app/appointments/new/page.tsx
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {slots.map((slot, index) => {
                          const startTime = new Date(slot.startTime);
                          const endTime = new Date(slot.endTime);
                          const timeStr = `${startTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedSlot({ startTime: slot.startTime, endTime: slot.endTime })}
                              className={`p-3 border-2 rounded-md text-sm font-medium transition-colors ${
                                isSelected
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                              }`}
                            >
                              <Clock className="w-4 h-4 inline-block mr-1" />
                              {timeStr}
                            </button>
                          );
                        })}
                      </div>
```

#### 4.4 إدخال سبب الزيارة (اختياري)
**الكود:**
```476:488:viclinc/websit/src/app/appointments/new/page.tsx
              {/* سبب الزيارة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سبب الزيارة (اختياري)
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="اكتب سبب زيارتك للطبيب..."
                />
              </div>
```

---

### المرحلة 5: إنشاء الحجز

#### 5.1 Frontend: إرسال طلب الحجز

**الكود:**
```116:155:viclinc/websit/src/app/appointments/new/page.tsx
  const handleCreateAppointment = async () => {
    if (!selectedDoctor) {
      alert('يرجى اختيار طبيب');
      return;
    }
    if (!selectedService) {
      alert('يرجى اختيار الخدمة');
      return;
    }
    if (!selectedDate || !selectedSlot) {
      alert('يرجى اختيار التاريخ والوقت المتاح');
      return;
    }

    try {
      setIsCreating(true);
      
      // استخدام _id إذا كان موجود (MongoDB) أو id (number)
      const doctorIdValue = selectedDoctor._id || selectedDoctor.id;
      const serviceIdValue = selectedService._id || selectedService.id;
      
      // استخدام startAt (ISO string) مباشرة من selectedSlot
      const startAt = selectedSlot.startTime; // ISO string
      
      await appointmentsService.createAppointment({
        doctorId: typeof doctorIdValue === 'string' ? doctorIdValue : String(doctorIdValue),
        serviceId: typeof serviceIdValue === 'string' ? serviceIdValue : String(serviceIdValue),
        startAt: startAt,
        type: appointmentType,
        metadata: reason.trim() ? { reason: reason.trim() } : undefined,
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('حدث خطأ في إنشاء الموعد');
    } finally {
      setIsCreating(false);
    }
  };
```

**API Service Call:**
```152:166:viclinc/websit/src/lib/api/appointments.ts
  // إنشاء موعد جديد
  createAppointment: (appointmentData: CreateAppointmentDto): Promise<Appointment> => {
    // استخدام endpoint الجديد /patient/appointments إذا كان يحتوي على التنسيق الجديد
    if (appointmentData.doctorId && appointmentData.serviceId && appointmentData.startAt && appointmentData.type) {
      return apiClient.post('/patient/appointments', {
        doctorId: appointmentData.doctorId,
        serviceId: appointmentData.serviceId,
        startAt: appointmentData.startAt,
        type: appointmentData.type,
        metadata: appointmentData.metadata || (appointmentData.reason ? { reason: appointmentData.reason } : undefined),
      });
    }
    // استخدام API القديم للتوافق
    return apiClient.post('/appointments', appointmentData);
  },
```

**HTTP Request:**
```http
POST /patient/appointments
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "doctorId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "serviceId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "startAt": "2024-01-15T10:00:00.000Z",
  "type": "IN_PERSON",
  "metadata": {
    "reason": "سبب الزيارة"
  }
}
```

**Idempotency Key (اختياري):**
يمكن إرسال `idempotency-key` في headers لمنع الحجز المكرر:
```http
idempotency-key: {unique-key}
```

---

#### 5.2 Backend: Controller

**Endpoint:** `POST /patient/appointments`

**Controller:**
```57:70:viclinc/clinic-api/src/modules/patients/patients.controller.ts
  @Post('appointments')
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentUser() user: User,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.appointmentService.createAppointment(
      createAppointmentDto,
      (user as any).sub || (user as any)._id?.toString(),
      idempotencyKey,
    );
  }
```

**الحماية:**
- `@UseGuards(JwtAuthGuard)` - يتطلب تسجيل الدخول
- `@CurrentUser()` - يحصل على معلومات المستخدم من JWT token

---

#### 5.3 Backend: Appointment Service

**الدالة الرئيسية:** `createAppointment`

**الخطوات التفصيلية:**

##### 5.3.1 التحقق من Idempotency Key
```typescript
if (idempotencyKey) {
  const existingKey = await this.redisService.getIdempotencyKey(`idempotency:${idempotencyKey}`);
  if (existingKey) {
    const existingAppointment = await this.appointmentModel.findById(existingKey);
    if (existingAppointment) {
      return this.mapToResponse(existingAppointment); // إرجاع الموعد الموجود
    }
  }
}
```

##### 5.3.2 التحقق من وجود الطبيب والخدمة
```typescript
await this.validateDoctorAndService(doctorId, serviceId);
```

**التحقق:**
- وجود الطبيب في قاعدة البيانات
- وجود الخدمة في قاعدة البيانات
- حالة الطبيب = `APPROVED`
- الطبيب يقدم هذه الخدمة (`DoctorService` موجود و `isActive = true`)

**الكود:**
```475:503:viclinc/clinic-api/src/modules/schedule/services/appointment.service.ts
  private async validateDoctorAndService(doctorId: Types.ObjectId, serviceId: Types.ObjectId): Promise<void> {
    const [doctor, service] = await Promise.all([
      this.doctorProfileModel.findById(doctorId),
      this.serviceModel.findById(serviceId),
    ]);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (doctor.status !== 'APPROVED') {
      throw new BadRequestException('Doctor is not approved');
    }

    // التحقق من أن الطبيب يقدم هذه الخدمة
    const doctorService = await this.doctorServiceModel.findOne({
      doctorId,
      serviceId,
      isActive: true,
    });

    if (!doctorService) {
      throw new BadRequestException('Doctor does not provide this service');
    }
  }
```

##### 5.3.3 التحقق من توفر الفتحة
```typescript
await this.validateAvailability(doctorId, serviceId, startAt);
```

**التحقق:**
- الفتحة موجودة في قائمة الفتحات المتاحة
- الفتحة غير محجوزة مسبقاً

**الكود:**
```508:543:viclinc/clinic-api/src/modules/schedule/services/appointment.service.ts
  private async validateAvailability(
    doctorId: Types.ObjectId,
    serviceId: Types.ObjectId,
    startAt: Date,
  ): Promise<void> {
    // استخدام UTC لضمان التطابق
    const startAtUtc = dayjs(startAt).utc();
    const weekStart = startAtUtc.startOf('week');
    
    const availability = await this.availabilityService.getDoctorAvailability(
      doctorId.toString(),
      serviceId.toString(),
      weekStart.toISOString(),
    );

    // استخدام UTC للمقارنة
    const requestedStartTime = startAtUtc;
    const isAvailable = availability.availableSlots.some(slot => {
      // مقارنة التاريخ والوقت معاً (مع التسامح في الدقائق)
      const slotTime = dayjs(slot.startTime).utc();
      
      // المقارنة بدقة الدقيقة (التجاهل للثواني والمللي ثانية)
      return slotTime.isSame(requestedStartTime, 'minute');
    });

    if (!isAvailable) {
      // إضافة معلومات إضافية للخطأ لمساعدة في التصحيح
      const availableTimes = availability.availableSlots
        .map(slot => dayjs(slot.startTime).utc().format('YYYY-MM-DD HH:mm'))
        .slice(0, 10); // أول 10 فتحات فقط
      
      throw new BadRequestException(
        `The requested time slot is not available. Requested: ${requestedStartTime.format('YYYY-MM-DD HH:mm')} UTC. Available slots: ${availableTimes.join(', ')}`
      );
    }
  }
```

##### 5.3.4 حساب المدة والسعر
```typescript
const { duration, price } = await this.calculateDurationAndPrice(doctorId, serviceId);
```

**القواعد:**
- المدة: `doctorService.customDuration` أو `service.defaultDurationMin` أو 30 دقيقة (افتراضي)
- السعر: `doctorService.customPrice` أو `service.defaultPrice` أو 0 (افتراضي)

**الكود:**
```548:564:viclinc/clinic-api/src/modules/schedule/services/appointment.service.ts
  private async calculateDurationAndPrice(
    doctorId: Types.ObjectId,
    serviceId: Types.ObjectId,
  ): Promise<{ duration: number; price: number }> {
    const doctorService = await this.doctorServiceModel.findOne({
      doctorId,
      serviceId,
      isActive: true,
    });

    const service = await this.serviceModel.findById(serviceId);

    const duration = doctorService?.customDuration || service?.defaultDurationMin || 30;
    const price = doctorService?.customPrice || service?.defaultPrice || 0;

    return { duration, price };
  }
```

##### 5.3.5 قفل Redis لمنع التداخل
```typescript
const lockKey = `appointment:lock:${doctorId}:${startAt.getTime()}`;
const lockAcquired = await this.redisService.acquireLock(lockKey, 30);

if (!lockAcquired) {
  throw new ConflictException('This time slot is currently being booked by another user');
}
```

**الهدف:** منع حجز نفس الفتحة من قبل مستخدمين متعددين في نفس الوقت.

##### 5.3.6 التحقق من عدم التداخل مرة أخرى
```typescript
await this.checkForConflicts(doctorId, startAt, endAt);
```

**التحقق:**
- عدم وجود مواعيد أخرى محجوزة في نفس الوقت
- الحالة: `PENDING_CONFIRM` أو `CONFIRMED`

**الكود:**
```569:595:viclinc/clinic-api/src/modules/schedule/services/appointment.service.ts
  private async checkForConflicts(
    doctorId: Types.ObjectId,
    startAt: Date,
    endAt: Date,
    excludeAppointmentId?: string,
  ): Promise<void> {
    const filter: any = {
      doctorId,
      status: { $in: [AppointmentStatus.PENDING_CONFIRM, AppointmentStatus.CONFIRMED] },
      $or: [
        {
          startAt: { $lt: endAt },
          endAt: { $gt: startAt },
        },
      ],
    };

    if (excludeAppointmentId) {
      filter._id = { $ne: new Types.ObjectId(excludeAppointmentId) };
    }

    const conflictingAppointment = await this.appointmentModel.findOne(filter);

    if (conflictingAppointment) {
      throw new ConflictException('Time slot conflicts with existing appointment');
    }
  }
```

##### 5.3.7 تحديد ما إذا كان الموعد يتطلب دفعاً
```typescript
const requiresPayment = createDto.type === AppointmentType.VIDEO || createDto.type === AppointmentType.CHAT;
```

**القاعدة:**
- `IN_PERSON` → لا يتطلب دفعاً (يُدفع في العيادة)
- `VIDEO` → يتطلب دفعاً
- `CHAT` → يتطلب دفعاً

##### 5.3.8 إنشاء الحجز في قاعدة البيانات
```typescript
const appointment = new this.appointmentModel({
  doctorId,
  patientId: new Types.ObjectId(patientId),
  serviceId,
  startAt,
  endAt,
  status: AppointmentStatus.PENDING_CONFIRM,
  type: createDto.type,
  idempotencyKey,
  price,
  duration,
  metadata: createDto.metadata,
  requiresPayment,
  paymentStatus: requiresPayment ? PaymentStatus.PENDING : PaymentStatus.NONE,
});

const savedAppointment = await appointment.save();
```

**الحالة الافتراضية:** `PENDING_CONFIRM` (في انتظار تأكيد الطبيب)

##### 5.3.9 إرسال إشعار للطبيب
```typescript
await this.notificationsService.sendNotificationToUser(
  savedAppointment.doctorId.toString(),
  'حجز موعد جديد',
  `${patientName} حجز موعد${serviceName ? ` لخدمة ${serviceName}` : ''} في ${appointmentDate} الساعة ${appointmentTime}`,
  {
    type: 'new_appointment',
    appointmentId: savedAppointment._id.toString(),
  },
);
```

##### 5.3.10 حفظ Idempotency Key
```typescript
if (idempotencyKey) {
  await this.redisService.setIdempotencyKey(
    `idempotency:${idempotencyKey}`,
    savedAppointment._id.toString(),
    900 // 15 دقيقة
  );
}
```

##### 5.3.11 تحرير القفل
```typescript
await this.redisService.releaseLock(lockKey);
```

##### 5.3.12 إرجاع النتيجة
```typescript
return this.mapToResponse(savedAppointment);
```

**Response Format:**
```typescript
{
  id: string;
  doctorId: string;
  patientId: string;
  serviceId: string;
  startAt: string; // ISO string
  endAt: string; // ISO string
  status: "PENDING_CONFIRM";
  type: "IN_PERSON" | "VIDEO" | "CHAT";
  price: number;
  duration: number;
  requiresPayment: boolean;
  paymentStatus: "NONE" | "PENDING" | "COMPLETED";
  metadata?: {
    reason?: string;
  };
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  doctor?: {
    id: string;
    name: string;
  };
  service?: {
    id: string;
    name: string;
  };
}
```

---

### المرحلة 6: بعد إنشاء الحجز

#### 6.1 إعادة التوجيه
بعد نجاح الحجز، يتم إعادة توجيه المستخدم إلى Dashboard:

```typescript
router.push('/dashboard');
```

#### 6.2 عرض المواعيد في Dashboard
يمكن للمستخدم رؤية مواعيده في `/dashboard`:

```typescript
GET /patient/appointments
```

---

## 🔄 حالات الموعد (Appointment Status)

1. **PENDING_CONFIRM** - في انتظار تأكيد الطبيب (الحالة الافتراضية بعد الحجز)
2. **CONFIRMED** - تم التأكيد من قبل الطبيب
3. **CANCELLED** - تم الإلغاء
4. **COMPLETED** - تم إكمال الموعد
5. **REJECTED** - تم رفض الموعد من قبل الطبيب

---

## 💳 نظام الدفع

### المواعيد التي تتطلب دفعاً
- `VIDEO` - استشارة فيديو
- `CHAT` - استشارة نصية

### المواعيد التي لا تتطلب دفعاً
- `IN_PERSON` - حجز عيادة (يُدفع في العيادة)

### حالات الدفع (Payment Status)
1. **NONE** - لا يتطلب دفعاً
2. **PENDING** - في انتظار الدفع
3. **COMPLETED** - تم الدفع

### ملاحظة مهمة
- المواعيد الحضورية (`IN_PERSON`) يمكن تأكيدها حتى لو كان الدفع قيد الانتظار (يُحصّل لاحقاً في العيادة)
- المواعيد الافتراضية (`VIDEO`/`CHAT`) يجب إكمال الدفع قبل التأكيد

---

## 🔔 الإشعارات

### إشعارات الطبيب
1. **حجز موعد جديد** - عند إنشاء حجز جديد
2. **إلغاء موعد** - عند إلغاء المريض للموعد
3. **إعادة جدولة** - عند إعادة جدولة الموعد

### إشعارات المريض
1. **تأكيد الموعد** - عند تأكيد الطبيب للموعد
2. **رفض الموعد** - عند رفض الطبيب للموعد
3. **إلغاء الموعد** - عند إلغاء الموعد

---

## 🔒 نقاط التحقق والأمان

### 1. المصادقة والتفويض
- ✅ تسجيل الدخول مطلوب (`JwtAuthGuard`)
- ✅ فقط المرضى يمكنهم حجز المواعيد (`ProtectedRoute` مع `requiredRole="PATIENT"`)

### 2. التحقق من البيانات
- ✅ التحقق من وجود الطبيب والخدمة
- ✅ التحقق من أن الطبيب معتمد (`status = APPROVED`)
- ✅ التحقق من أن الطبيب يقدم الخدمة المطلوبة
- ✅ التحقق من توفر الفتحة الزمنية

### 3. منع التداخل
- ✅ قفل Redis لمنع الحجز المتزامن
- ✅ التحقق من عدم وجود مواعيد متداخلة
- ✅ Idempotency Key لمنع الحجز المكرر

### 4. التحقق من الوقت
- ✅ التحقق من أن الوقت في المستقبل
- ✅ التحقق من أن الفتحة متاحة في جدول الطبيب

---

## 📊 مخطط الفلو

```
┌─────────────────────────────────────────────────────────────┐
│                    المستخدم (Patient)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              صفحة حجز الموعد (/appointments/new)            │
│  - اختيار نوع الموعد (IN_PERSON/VIDEO/CHAT)                │
│  - اختيار الطبيب                                            │
│  - اختيار الخدمة                                            │
│  - اختيار التاريخ والوقت                                    │
│  - إدخال سبب الزيارة (اختياري)                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend API Layer                        │
│  - appointmentsService.createAppointment()                    │
│  - apiClient.post('/patient/appointments')                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Request                              │
│  POST /patient/appointments                                  │
│  Authorization: Bearer {JWT_TOKEN}                          │
│  Body: { doctorId, serviceId, startAt, type, metadata }      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Controller                              │
│  PatientsController.createAppointment()                    │
│  - JwtAuthGuard (التحقق من تسجيل الدخول)                    │
│  - CurrentUser (الحصول على معلومات المستخدم)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Appointment Service                             │
│  createAppointment()                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. التحقق من Idempotency Key                         │  │
│  │ 2. التحقق من وجود الطبيب والخدمة                    │  │
│  │ 3. التحقق من توفر الفتحة                             │  │
│  │ 4. حساب المدة والسعر                                  │  │
│  │ 5. قفل Redis                                          │  │
│  │ 6. التحقق من عدم التداخل                             │  │
│  │ 7. تحديد ما إذا كان يتطلب دفعاً                      │  │
│  │ 8. إنشاء الحجز في قاعدة البيانات                    │  │
│  │ 9. إرسال إشعار للطبيب                                │  │
│  │ 10. حفظ Idempotency Key                              │  │
│  │ 11. تحرير القفل                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    قاعدة البيانات (MongoDB)                  │
│  - حفظ الموعد في collection 'appointments'                 │
│  - الحالة: PENDING_CONFIRM                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Notifications Service                     │
│  - إرسال إشعار للطبيب بحجز جديد                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Response                                 │
│  { id, doctorId, patientId, serviceId, startAt, endAt,     │
│    status, type, price, duration, ... }                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend                                 │
│  - إعادة التوجيه إلى /dashboard                            │
│  - عرض رسالة نجاح (اختياري)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 ملاحظات مهمة

### 1. الوقت والتوقيت
- جميع الأوقات تُحفظ في UTC في قاعدة البيانات
- يتم تحويل الأوقات للعرض حسب المنطقة الزمنية للمستخدم

### 2. Idempotency Key
- يُستخدم لمنع الحجز المكرر في حالة إعادة المحاولة
- يُحفظ في Redis لمدة 15 دقيقة
- اختياري ولكن يُنصح باستخدامه

### 3. Redis Lock
- يُستخدم لمنع حجز نفس الفتحة من قبل مستخدمين متعددين
- مدة القفل: 30 ثانية
- يتم تحريره تلقائياً بعد إنشاء الحجز

### 4. الحالة الافتراضية
- بعد إنشاء الحجز، الحالة تكون `PENDING_CONFIRM`
- يجب على الطبيب تأكيد الموعد ليصبح `CONFIRMED`

### 5. الدفع
- المواعيد الحضورية (`IN_PERSON`) لا تتطلب دفعاً مسبقاً
- المواعيد الافتراضية (`VIDEO`/`CHAT`) تتطلب دفعاً قبل التأكيد

---

## 🐛 معالجة الأخطاء

### أخطاء شائعة ومعالجتها

1. **Doctor not found**
   - الخطأ: `NotFoundException('Doctor not found')`
   - الحل: التحقق من وجود الطبيب في قاعدة البيانات

2. **Service not found**
   - الخطأ: `NotFoundException('Service not found')`
   - الحل: التحقق من وجود الخدمة في قاعدة البيانات

3. **Doctor does not provide this service**
   - الخطأ: `BadRequestException('Doctor does not provide this service')`
   - الحل: التحقق من أن الطبيب يقدم هذه الخدمة (`DoctorService` موجود و `isActive = true`)

4. **Time slot is not available**
   - الخطأ: `BadRequestException('The requested time slot is not available')`
   - الحل: التحقق من أن الفتحة موجودة في قائمة الفتحات المتاحة

5. **Time slot conflicts with existing appointment**
   - الخطأ: `ConflictException('Time slot conflicts with existing appointment')`
   - الحل: التحقق من عدم وجود مواعيد متداخلة

6. **This time slot is currently being booked by another user**
   - الخطأ: `ConflictException('This time slot is currently being booked by another user')`
   - الحل: المحاولة مرة أخرى بعد بضع ثوانٍ

---

## ✅ الخلاصة

عملية حجز الموعد في الويبسايت تتم عبر الخطوات التالية:

1. **الواجهة الأمامية:** المستخدم يختار الطبيب والخدمة والتاريخ والوقت
2. **جلب التوفر:** يتم جلب الفتحات المتاحة من API
3. **إنشاء الحجز:** يتم إرسال طلب الحجز إلى Backend
4. **التحقق:** يتم التحقق من جميع البيانات والقيود
5. **الحفظ:** يتم حفظ الموعد في قاعدة البيانات
6. **الإشعارات:** يتم إرسال إشعار للطبيب
7. **النتيجة:** يتم إرجاع الموعد المُنشأ وإعادة التوجيه إلى Dashboard

النظام يتضمن:
- ✅ حماية قوية ضد الأخطاء والتداخل
- ✅ دعم Idempotency لمنع الحجز المكرر
- ✅ نظام إشعارات شامل
- ✅ دعم أنواع مواعيد متعددة (حضوري/فيديو/نصي)
- ✅ نظام دفع متكامل

---

**تاريخ الإنشاء:** 2024  
**آخر تحديث:** 2024




