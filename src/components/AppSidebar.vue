<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a5 5 0 0 0-5 5v2a3 3 0 0 0-3 3v1a3 3 0 0 0 3 3v1a5 5 0 0 0 5 5 5 5 0 0 0 5-5v-1a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3V7a5 5 0 0 0-5-5z" />
      </svg>
      <div class="sidebar-logo-text">
        <span class="sidebar-logo-title">观舌护齿</span>
        <span class="sidebar-logo-sub">Oral Care AI Platform</span>
      </div>
    </div>

    <nav class="sidebar-section">
      <RouterLink to="/home" class="sidebar-item" active-class="active" exact-active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
        </svg>
        <span>首页</span>
      </RouterLink>

      <RouterLink to="/scan" class="sidebar-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <span>拍照自查</span>
      </RouterLink>

      <RouterLink to="/records" class="sidebar-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <span>口腔档案</span>
      </RouterLink>

      <RouterLink to="/articles" class="sidebar-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <span>健康科普</span>
      </RouterLink>

      <RouterLink to="/assistant" class="sidebar-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16" />
          <line x1="16" y1="16" x2="16" y2="16" />
        </svg>
        <span>AI咨询助手</span>
      </RouterLink>

      <RouterLink to="/profile" class="sidebar-item" active-class="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>我的</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 232px;
  background: var(--sidebar-bg);
  padding: 20px 12px;
  overflow: visible;
  z-index: 20;
}

.sidebar-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 4px 12px 20px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo svg {
  width: 30px;
  height: 30px;
  color: #7fd1b9;
  flex-shrink: 0;
}

.sidebar-logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.sidebar-logo-title {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
}

.sidebar-logo-sub {
  color: rgba(255, 255, 255, 0.45);
  font-size: 11px;
  margin-top: 2px;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
  margin-bottom: 2px;
}

.sidebar-item:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  color: #fff;
}

/* 激活项：右侧胶囊凸出（保留原设计） */
.sidebar-item.active {
  background: var(--panel-bg);
  color: #1f4a46;
  font-weight: 500;
  position: relative;
  margin-right: -12px;
  padding-right: 24px;
  border-radius: 999px 0 0 999px;
  transform: none;
}

.sidebar-item svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px;
    padding: 16px 8px;
  }
  .sidebar-logo-text,
  .sidebar-item span {
    display: none;
  }
  .sidebar-item {
    justify-content: center;
  }
  .sidebar-item.active {
    margin-right: -8px;
    padding-right: 12px;
  }
}
</style>
