<template>
  <div class="login-body">
    <!-- 左：品牌区 -->
    <div class="left-panel">
      <div class="panel-content">
        <div class="robot-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a5 5 0 0 0-5 5v2a3 3 0 0 0-3 3v1a3 3 0 0 0 3 3v1a5 5 0 0 0 5 5 5 5 0 0 0 5-5v-1a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3V7a5 5 0 0 0-5-5z" />
          </svg>
        </div>
        <h1>观舌护齿</h1>
        <p>融合 CNN 与中医舌象的<br />牙齿亚健康早筛系统</p>
      </div>
      <div class="viewer-count">舌象 + 牙齿双模态 · 中医辨证融合评估</div>
    </div>

    <!-- 右：表单区 -->
    <div class="right-panel">
      <div class="login-container">
        <span class="role-badge">{{ mode === 'login' ? '用户登录' : '注册新账号' }}</span>
        <h2>{{ mode === 'login' ? '欢迎回来' : '创建账号' }}</h2>
        <p class="subtitle">
          {{ mode === 'login' ? '登录后可保存筛查报告与健康档案' : '手机号即账号，用于保存你的口腔健康记录' }}
        </p>

        <form @submit.prevent="onSubmit">
          <div v-if="mode === 'register'" class="form-group">
            <label>真实姓名<span class="required">*</span></label>
            <input v-model.trim="realName" type="text" placeholder="请输入真实姓名" autocomplete="name" />
          </div>

          <div class="form-group">
            <label>手机号<span class="required">*</span></label>
            <input v-model.trim="phone" type="text" placeholder="请输入 11 位手机号" autocomplete="username" />
          </div>

          <div class="form-group">
            <label>密码<span class="required">*</span></label>
            <input v-model="password" type="password" placeholder="至少 6 位" autocomplete="current-password" />
          </div>

          <button class="btn-login" type="submit" :disabled="loading">
            {{ loading ? '请稍候…' : mode === 'login' ? '登 录' : '注 册' }}
          </button>
        </form>

        <div class="register-link">
          <template v-if="mode === 'login'">
            还没有账号？<a @click="switchMode('register')">立即注册</a>
          </template>
          <template v-else>
            已有账号？<a @click="switchMode('login')">返回登录</a>
          </template>
        </div>

        <div class="demo-hint">演示账号：13800000000 / 123456</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'
import { validateLogin, validateRegister } from '@/utils/validate'

const router = useRouter()
const userStore = useUserStore()
const toast = useToast()

const mode = ref<'login' | 'register'>('login')
const realName = ref('')
const phone = ref('')
const password = ref('')
const loading = ref(false)

function switchMode(next: 'login' | 'register') {
  mode.value = next
  password.value = ''
}

async function onSubmit() {
  const invalid =
    mode.value === 'login'
      ? validateLogin(phone.value, password.value)
      : validateRegister(realName.value, phone.value, password.value)
  if (invalid) {
    toast.error(invalid)
    return
  }

  loading.value = true
  try {
    if (mode.value === 'login') {
      const res = await login(phone.value, password.value)
      userStore.setLogin({ token: res.token, user: res.user })
      toast.success('登录成功')
      router.push('/home')
    } else {
      await register(realName.value, phone.value, password.value)
      toast.success('注册成功，请登录')
      mode.value = 'login'
      password.value = ''
    }
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-body {
  min-height: 100vh;
  display: flex;
  background: #f0f2f5;
}

.left-panel {
  flex: 1;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.left-panel::before,
.left-panel::after {
  content: '';
  position: absolute;
  border-radius: 50%;
}

.left-panel::before {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.3), transparent);
  top: -100px;
  left: -100px;
}

.left-panel::after {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.2), transparent);
  bottom: -50px;
  right: -50px;
}

.panel-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.robot-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 32px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.robot-icon svg {
  width: 70px;
  height: 70px;
  color: #7fd1b9;
}

.left-panel h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: 4px;
}

.left-panel p {
  font-size: 16px;
  opacity: 0.8;
  line-height: 1.8;
}

.viewer-count {
  position: absolute;
  bottom: 40px;
  font-size: 14px;
  opacity: 0.6;
}

.right-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  padding: 40px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #f0fdfa;
  color: #0d9488;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 16px;
}

.login-container h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-group .required {
  color: #ef4444;
  margin-left: 2px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #fff;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.3);
  margin-top: 4px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6b7280;
}

.register-link a {
  color: #0d9488;
  font-weight: 500;
  cursor: pointer;
}

.register-link a:hover {
  text-decoration: underline;
}

.demo-hint {
  margin-top: 16px;
  padding: 10px 14px;
  background: #f9fafb;
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}

@media (max-width: 900px) {
  .left-panel {
    display: none;
  }
}
</style>
