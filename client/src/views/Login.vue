<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold" style="font-family: 'Montserrat', sans-serif;">
          <span style="color: #124DA3;">CODE</span><span style="color: #F37022;">DEN</span><span style="color: #4EB748;">NGU</span>
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Đăng nhập để tiếp tục
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <BaseInput
            v-model="email"
            type="email"
            label="Email"
            placeholder="admin@example.com"
            required
          />

          <BaseInput
            v-model="password"
            type="password"
            label="Mật khẩu"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <BaseButton
            type="submit"
            :loading="loading"
            class="w-full"
          >
            Đăng nhập
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { useNotificationStore } from '@/stores/notificationStore';

const router = useRouter();
const notificationStore = useNotificationStore();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.post('/login', {
      email: email.value,
      password: password.value
    });

    const data = response.data.data || response.data;
    const { token, user } = data;

    // Store auth data
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Check if user has admin role
    const isAdmin = user.roles?.includes('ADMIN') || user.roles?.includes('admin');
    localStorage.setItem('role', JSON.stringify({ code: isAdmin ? 'ADMIN' : 'USER' }));

    // Add welcome notification
    notificationStore.addSuccess(`Chào mừng ${user.name || 'bạn'} quay trở lại!`);

    // Redirect to dashboard
    router.push('/');
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Đăng nhập thất bại';
    notificationStore.addError('Đăng nhập thất bại: ' + (err.response?.data?.error || 'Lỗi không xác định'));
  } finally {
    loading.value = false;
  }
};
</script>