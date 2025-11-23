<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          HRM System
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

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    });

    const { user, role } = response.data;

    // Store user data
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', JSON.stringify(role));

    // Redirect based on role
    if (role.code === 'ADMIN') {
      router.push('/dashboard');
    } else {
      router.push('/employee/info');
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Đăng nhập thất bại';
  } finally {
    loading.value = false;
  }
};
</script>