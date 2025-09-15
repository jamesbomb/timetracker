<template>
  <div class="login-container">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="5" lg="4">
          <v-card class="login-card" elevation="24">
            <div class="logo-container">
              <img src="@/assets/logo.svg" alt="Logo" class="logo" />
              <h1 class="welcome-title">Welcome Back</h1>
              <p class="welcome-subtitle">Sign in to manage your holidays and time off</p>
            </div>
            
            <v-card-text class="px-8 pb-8">
              <v-form @submit.prevent="onLogin">
                <v-text-field
                  v-model="email"
                  label="Email Address"
                  type="email"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                  required
                />
                <v-text-field
                  v-model="password"
                  label="Password"
                  type="password"
                  prepend-inner-icon="mdi-lock-outline"
                  variant="outlined"
                  density="comfortable"
                  class="mb-6"
                  required
                />
                
                <v-btn 
                  type="submit" 
                  color="primary" 
                  size="large"
                  block
                  class="mb-4 text-none"
                  elevation="0"
                  height="48"
                >
                  Sign In
                </v-btn>
                
                <div class="divider-container">
                  <v-divider class="divider-line" />
                  <span class="divider-text">OR</span>
                  <v-divider class="divider-line" />
                </div>
                
                <v-btn 
                  variant="outlined"
                  size="large"
                  block
                  class="google-button text-none"
                  @click="loginWithGoogle"
                  height="48"
                >
                  <v-icon start>mdi-google</v-icon>
                  Continue with Google
                </v-btn>
              </v-form>
              
              <div class="signup-link">
                Don't have an account? 
                <router-link :to="{ name: 'Signup' }" class="link">
                  Sign up
                </router-link>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from '@/store/auth';

export default defineComponent({
  name: 'Login',
  setup() {
    const auth = useAuthStore();
    const email = ref('');
    const password = ref('');

    const onLogin = async () => {
      try {
        await auth.login(email.value, password.value);
        await auth.fetchUser();
        window.location.href = '/dashboard';
      } catch (err: any) {
        alert(err.message || 'Login failed');
      }
    };

    const loginWithGoogle = async () => {
      try {
        await auth.signinWithGoogle();
        await auth.fetchUser();
        window.location.href = '/dashboard';
      } catch (err: any) {
        alert(err.message || 'Google login failed');
      }
    };

    return { email, password, onLogin, loginWithGoogle };
  },
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #008448 0%, #00592f 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(45deg, rgba(0, 89, 47, 0.08) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(0, 89, 47, 0.08) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(0, 89, 47, 0.08) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(0, 89, 47, 0.08) 75%);
  background-size: 50px 50px;
  background-position: 0 0, 0 25px, 25px -25px, -25px 0px;
}

.login-card {
  border-radius: 16px !important;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.98) !important;
}

.logo-container {
  text-align: center;
  padding: 3rem 2rem 2rem;
}

.logo {
  width: 160px;
  height: auto;
  max-height: 60px;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 10px 30px rgba(0, 132, 72, 0.3));
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0;
}

.divider-container {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider-line {
  flex: 1;
}

.divider-text {
  padding: 0 1rem;
  color: #999;
  font-size: 0.875rem;
}

.google-button {
  border-color: #e0e0e0 !important;
  transition: all 0.3s ease;
}

.google-button:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.signup-link {
  text-align: center;
  margin-top: 2rem;
  color: #666;
  font-size: 0.9rem;
}

.link {
  color: #008448;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link:hover {
  color: #00592f;
  text-decoration: underline;
}

:deep(.v-field--outlined) {
  border-radius: 8px;
}

:deep(.v-btn) {
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

:deep(.v-btn--variant-elevated) {
  background: linear-gradient(135deg, #008448 0%, #00592f 100%);
}

:deep(.v-btn--variant-elevated:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 132, 72, 0.3);
}
</style>
