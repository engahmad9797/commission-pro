<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="لوحة تحكم الموقع">
  <title>لوحة الإدارة</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root {
      --primary-color: #2563eb;
      --primary-hover: #1d4ed8;
      --danger-color: #dc2626;
      --danger-hover: #b91c1c;
      --success-color: #16a34a;
      --bg-color: #f8fafc;
      --card-bg: #ffffff;
      --text-primary: #1e293b;
      --text-secondary: #64748b;
      --border-color: #e2e8f0;
      --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-primary);
      line-height: 1.6;
      direction: rtl;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, var(--primary-color), #1e40af);
      color: white;
      padding: 2rem 0;
      margin-bottom: 2rem;
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
    }

    .header h1 {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
    }

    /* Login Form */
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
    }

    .login-card {
      background: var(--card-bg);
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 400px;
      border: 1px solid var(--border-color);
    }

    .login-card h3 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
      font-size: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: var(--card-bg);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-hover);
      transform: translateY(-2px);
    }

    .btn-danger {
      background: var(--danger-color);
      color: white;
    }

    .btn-danger:hover {
      background: var(--danger-hover);
    }

    .btn-success {
      background: var(--success-color);
      color: white;
    }

    .btn-success:hover {
      background: #15803d;
    }

    .btn-secondary {
      background: var(--text-secondary);
      color: white;
    }

    .btn-secondary:hover {
      background: #475569;
    }

    /* Admin Area */
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .admin-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .admin-content {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      transition: all 0.3s ease;
    }

    .card:hover {
      box-shadow: var(--shadow-lg);
    }

    .card h3 {
      margin-bottom: 1rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-item {
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }

    .page-item:hover {
      border-color: var(--primary-color);
      transform: translateX(-4px);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .page-title {
      font-weight: 600;
      color: var(--text-primary);
    }

    .page-slug {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .page-actions {
      display: flex;
      gap: 8px;
      margin-top: 1rem;
    }

    .btn-small {
      padding: 6px 12px;
      font-size: 0.875rem;
    }

    /* Form Styles */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    textarea.form-control {
      resize: vertical;
      min-height: 150px;
      font-family: 'Courier New', monospace;
    }

    /* Notifications */
    .notification {
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      transform: translateY(-100px);
      opacity: 0;
      transition: all 0.3s ease;
    }

    .notification.show {
      transform: translateY(0);
      opacity: 1;
    }

    .notification.success {
      background: var(--success-color);
    }

    .notification.error {
      background: var(--danger-color);
    }

    .notification.info {
      background: var(--primary-color);
    }

    /* Loading */
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-secondary);
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    /* User Area */
    .user-profile {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow);
      max-width: 600px;
      margin: 2rem auto;
    }

    .user-profile h3 {
      color: var(--primary-color);
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .user-info {
      margin-bottom: 1.5rem;
    }

    .user-info label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .user-info input {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-color);
    }

    /* Accessibility */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1><i class="fas fa-cogs"></i> لوحة تحكم الموقع</h1>
    </header>

    <!-- Login Section -->
    <div id="loginBox" class="login-container">
      <div class="login-card">
        <h3><i class="fas fa-sign-in-alt"></i> تسجيل الدخول</h3>
        <form id="loginForm" onsubmit="return login(event)">
          <div class="form-group">
            <label for="username">اسم المستخدم</label>
            <input type="text" id="username" class="form-control" placeholder="أدخل اسم المستخدم" required autocomplete="username">
          </div>
          <div class="form-group">
            <label for="password">كلمة المرور</label>
            <input type="password" id="password" class="form-control" placeholder="أدخل كلمة المرور" required autocomplete="current-password">
            <small style="color: var(--text-secondary); font-size: 0.875rem;">
              المسؤول: استخدم بيانات الاعتماد الخاصة بك فقط
            </small>
          </div>
          <button type="submit" class="btn btn-primary" id="loginBtn">
            <i class="fas fa-sign-in-alt"></i>
            <span>دخول</span>
          </button>
        </form>
        <div id="loginMsg" class="notification" style="position: relative; top: auto; left: auto; right: auto; transform: none; opacity: 1; margin-top: 1rem;"></div>
      </div>
    </div>

    <!-- Admin Area -->
    <div id="adminArea" style="display: none;">
      <div class="admin-header">
        <h2><i class="fas fa-tachometer-alt"></i> لوحة التحكم (مسؤول)</h2>
        <button class="btn btn-danger" onclick="logout()">
          <i class="fas fa-sign-out-alt"></i>
          تسجيل خروج
        </button>
      </div>

      <div class="admin-content">
        <!-- Pages List -->
        <div class="card">
          <h3><i class="fas fa-file-alt"></i> الصفحات</h3>
          <div id="pagesList">
            <div class="empty-state">
              <i class="fas fa-folder-open"></i>
              <p>لا توجد صفحات بعد</p>
            </div>
          </div>
        </div>

        <!-- Page Form -->
        <div class="card">
          <h3><i class="fas fa-plus-circle"></i> إضافة / تحرير صفحة</h3>
          <form id="pageForm" onsubmit="return savePage(event)">
            <input id="pageId" type="hidden">
            <div class="form-group">
              <label for="slug">Slug (معرف الصفحة)</label>
              <input type="text" id="slug" class="form-control" placeholder="مثال: about" pattern="[a-z0-9-]+" required>
              <small style="color: var(--text-secondary); font-size: 0.875rem;">استخدم أحرف إنجليزية صغيرة، أرقام، وشرطات فقط</small>
            </div>
            <div class="form-group">
              <label for="title">العنوان</label>
              <input type="text" id="title" class="form-control" placeholder="أدخل عنوان الصفحة" required>
            </div>
            <div class="form-group">
              <label for="body">المحتوى</label>
              <textarea id="body" class="form-control" rows="8" placeholder="المحتوى (HTML مسموح)" required></textarea>
            </div>
            <div class="form-row">
              <button type="submit" class="btn btn-success" id="saveBtn">
                <i class="fas fa-save"></i>
                <span>حفظ</span>
              </button>
              <button type="button" class="btn btn-secondary" onclick="clearForm()">
                <i class="fas fa-plus"></i>
                جديد
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- User Area -->
    <div id="userArea" style="display: none;">
      <div class="header">
        <h1><i class="fas fa-user"></i> صفحة المستخدم</h1>
      </div>
      
      <div class="user-profile">
        <h3>مرحباً بك في صفحتك الشخصية</h3>
        <p>هنا يمكنك عرض معلوماتك الشخصية وتغيير كلمة المرور.</p>
        
        <div class="user-info">
          <label>اسم المستخدم</label>
          <input type="text" class="form-control" id="userUsername" readonly>
        </div>
        
        <div class="user-info">
          <label>البريد الإلكتروني</label>
          <input type="email" class="form-control" id="userEmail" readonly>
        </div>
        
        <button class="btn btn-primary" onclick="showChangePasswordForm()">
          <i class="fas fa-key"></i> تغيير كلمة المرور
        </button>
        
        <button class="btn btn-danger" onclick="logout()" style="margin-top: 1rem;">
          <i class="fas fa-sign-out-alt"></i> تسجيل خروج
        </button>
      </div>
    </div>
  </div>

  <!-- Notification Container -->
  <div id="notification" class="notification"></div>

  <script>
    // بيانات الاعتماد الخاصة بالمسؤول
    const ADMIN_CREDENTIALS = {
      username: "admin", // غير هذا إلى اسم المستخدم الخاص بك
      password: "admin123" // غير هذا إلى كلمة المرور الخاصة بك
    };

    // Utility functions
    function showNotification(message, type = 'info') {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.className = `notification ${type}`;
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 4000);
    }

    function setLoading(button, loading) {
      const btn = button;
      const span = btn.querySelector('span');
      const icon = btn.querySelector('i');
      
      if (loading) {
        btn.disabled = true;
        btn.classList.add('disabled');
        span.textContent = 'جاري المعالجة...';
        icon.className = 'fas fa-spinner fa-spin';
      } else {
        btn.disabled = false;
        btn.classList.remove('disabled');
        icon.className = btn.id === 'loginBtn' ? 'fas fa-sign-in-alt' : 'fas fa-save';
        span.textContent = btn.id === 'loginBtn' ? 'دخول' : 'حفظ';
      }
    }

    function validateForm() {
      const slug = document.getElementById('slug').value;
      const title = document.getElementById('title').value;
      const body = document.getElementById('body').value;

      if (!slug || !title || !body) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return false;
      }

      if (!/^[a-z0-9-]+$/.test(slug)) {
        showNotification('Slug يجب أن يحتوي على أحرف إنجليزية صغيرة، أرقام، وشرطات فقط', 'error');
        return false;
      }

      return true;
    }

    // Authentication functions
    async function login(event) {
      event.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const loginBtn = document.getElementById('loginBtn');
      const loginMsg = document.getElementById('loginMsg');

      setLoading(loginBtn, true);
      loginMsg.className = 'notification info';
      loginMsg.textContent = 'جاري تسجيل الدخول...';

      // التحقق مما إذا كان المستخدم هو المسؤول
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('adminArea').style.display = 'block';
        showNotification('تم تسجيل الدخول بنجاح', 'success');
        loadPages();
        setLoading(loginBtn, false);
        return;
      }

      // للمستخدمين العاديين - محاكاة تسجيل دخول ناجح بدون صلاحية لوحة التحكم
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCSRFToken()
          },
          body: JSON.stringify({ username, password }),
          credentials: 'include'
        });

        const result = await response.json();

        if (response.ok) {
          // للمستخدمين العاديين - عرض رسالة ترحيب بدون صلاحية لوحة التحكم
          loginMsg.className = 'notification success';
          loginMsg.textContent = `مرحباً ${username}! لست مسؤولاً للوصول إلى لوحة التحكم`;
          
          // إعادة توجيه المستخدم العادي إلى صفحة المستخدم بعد ثانيتين
          setTimeout(() => {
            document.getElementById('loginBox').style.display = 'none';
            document.getElementById('userArea').style.display = 'block';
            document.getElementById('userUsername').value = username;
            document.getElementById('userEmail').value = 'user@example.com'; // يمكن جلبه من الخادم
            showNotification('تم تسجيل الدخول كـ مستخدم عادي', 'info');
          }, 2000);
        } else {
          loginMsg.className = 'notification error';
          loginMsg.textContent = result.error || 'اسم المستخدم أو كلمة المرور غير صحيحة';
        }
      } catch (error) {
        loginMsg.className = 'notification error';
        loginMsg.textContent = 'حدث خطأ في الاتصال بالخادم';
        console.error('Login error:', error);
      } finally {
        setLoading(loginBtn, false);
      }
    }

    async function logout() {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'X-CSRF-Token': getCSRFToken()
          },
          credentials: 'include'
        });
        
        // إخفاء جميع المناطق
        document.getElementById('adminArea').style.display = 'none';
        document.getElementById('userArea').style.display = 'none';
        document.getElementById('loginBox').style.display = 'flex';
        
        // إعادة تعيين النماذج
        document.getElementById('loginForm').reset();
        showNotification('تم تسجيل الخروج بنجاح', 'info');
      } catch (error) {
        showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
        console.error('Logout error:', error);
      }
    }

    // Page management functions
    async function loadPages() {
      const container = document.getElementById('pagesList');
      
      try {
        const response = await fetch('/api/pages', {
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            document.getElementById('adminArea').style.display = 'none';
            document.getElementById('loginBox').style.display = 'flex';
            showNotification('انتهت جلسة العمل، يرجى تسجيل الدخول مرة أخرى', 'error');
          } else {
            showNotification('فشل في تحميل الصفحات', 'error');
          }
          return;
        }

        const pages = await response.json();
        container.innerHTML = '';

        if (pages.length === 0) {
          container.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-folder-open"></i>
              <p>لا توجد صفحات بعد</p>
            </div>
          `;
          return;
        }

        pages.forEach(page => {
          const pageDiv = document.createElement('div');
          pageDiv.className = 'page-item';
          pageDiv.innerHTML = `
            <div class="page-header">
              <div>
                <div class="page-title">${escapeHtml(page.title)}</div>
                <div class="page-slug">/${escapeHtml(page.slug)}</div>
              </div>
            </div>
            <div class="page-actions">
              <button class="btn btn-primary btn-small" onclick="editPage(${page.id})">
                <i class="fas fa-edit"></i>
                تعديل
              </button>
              <button class="btn btn-danger btn-small" onclick="delPage(${page.id})">
                <i class="fas fa-trash"></i>
                حذف
              </button>
            </div>
          `;
          container.appendChild(pageDiv);
        });
      } catch (error) {
        showNotification('حدث خطأ في تحميل الصفحات', 'error');
        console.error('Load pages error:', error);
      }
    }

    async function editPage(id) {
      try {
        const response = await fetch(`/api/pages/${id}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          showNotification('فشل في تحميل بيانات الصفحة', 'error');
          return;
        }

        const page = await response.json
