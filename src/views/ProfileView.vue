<template>
  <div class="profile-page">
    <header class="page-header">
      <h2>我的</h2>
      <p>管理个人资料与健康打卡</p>
    </header>

    <div class="profile-grid">
      <!-- 用户卡片 -->
      <section class="card user-card">
        <div class="user-avatar">{{ avatarText }}</div>
        <h3 class="user-name">{{ form.realName || '未命名用户' }}</h3>
        <p class="user-phone">{{ profile?.phone || '—' }}</p>

        <div class="user-stats">
          <div>
            <span class="stat-num">{{ streakDays }}</span>
            <span class="stat-label">连续打卡</span>
          </div>
          <div>
            <span class="stat-num">{{ recordCount }}</span>
            <span class="stat-label">筛查次数</span>
          </div>
        </div>

        <button class="btn btn-secondary btn-sm checkin-btn" :disabled="checkedToday" @click="onCheckin">
          {{ checkedToday ? '今日已打卡' : '今日打卡' }}
        </button>

        <button class="btn btn-danger btn-sm logout-btn" @click="onLogout">退出登录</button>
      </section>

      <!-- 资料编辑 -->
      <section class="card">
        <h3 class="card-title">个人资料</h3>
        <form @submit.prevent="onSave">
          <div class="form-group">
            <label class="form-label">真实姓名</label>
            <input v-model.trim="form.realName" class="form-input" type="text" placeholder="请输入真实姓名" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">性别</label>
              <select v-model="form.gender" class="form-select">
                <option value="unknown">未设置</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">年龄</label>
              <input v-model.number="form.age" class="form-input" type="number" min="0" max="150" placeholder="选填" />
            </div>
          </div>
          <button class="btn btn-primary" type="submit" :disabled="saving">
            {{ saving ? '保存中…' : '保存资料' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getProfile, updateProfile } from '@/api/profile'
import { doCheckin, getStreak } from '@/api/checkin'
import { listRecords } from '@/api/records'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'
import type { UserInfo } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const toast = useToast()

const profile = ref<UserInfo | null>(null)
const streakDays = ref(0)
const checkedToday = ref(false)
const recordCount = ref(0)
const saving = ref(false)

const form = reactive({
  realName: '',
  gender: 'unknown' as UserInfo['gender'],
  age: null as number | null,
})

const avatarText = computed(() => (form.realName || 'U').slice(0, 1))

async function load() {
  try {
    const [me, streak, records] = await Promise.all([getProfile(), getStreak(), listRecords(1, 1)])
    profile.value = me
    form.realName = me.realName
    form.gender = me.gender
    form.age = me.age
    streakDays.value = streak.streakDays
    const today = new Date().toISOString().slice(0, 10)
    checkedToday.value = streak.dates.includes(today)
    recordCount.value = records.total
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载失败')
  }
}

async function onSave() {
  saving.value = true
  try {
    const res = await updateProfile({
      realName: form.realName,
      gender: form.gender,
      age: form.age,
    })
    profile.value = res.user
    userStore.setUser(res.user)
    toast.success('资料已保存')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    saving.value = false
  }
}

async function onCheckin() {
  try {
    const res = await doCheckin()
    streakDays.value = res.streakDays
    checkedToday.value = true
    toast.success(`打卡成功，已连续 ${res.streakDays} 天`)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '打卡失败')
  }
}

function onLogout() {
  if (!window.confirm('确定退出登录吗？')) return
  userStore.logout()
  toast.info('已退出登录')
  router.push('/login')
}

onMounted(load)
</script>

<style scoped>
.profile-page {
  padding: 20px;
  background: var(--panel-bg);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.06);
  min-height: calc(100vh - 24px);
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.page-header p {
  font-size: 14px;
  color: #6b7280;
}

.profile-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 16px;
  align-items: start;
}

.card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.08);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.user-card {
  text-align: center;
}

.user-avatar {
  width: 76px;
  height: 76px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  font-size: 32px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.user-phone {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 20px;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 16px 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 20px;
}

.user-stats > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--sidebar-bg);
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
}

.checkin-btn {
  width: 100%;
  margin-bottom: 10px;
}

.logout-btn {
  width: 100%;
}

@media (max-width: 820px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
