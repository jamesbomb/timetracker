<template>
  <v-app>
    <v-app-bar 
      flat 
      color="primary"
      elevation="2"
      dark
    >
      <v-container fluid>
        <v-row align="center" no-gutters>
          <v-col cols="auto">
            <div>
              <h2 class="text-h5 font-weight-bold text-white">{{ greeting }} {{ userName }}</h2>
              <p class="text-caption text-white-70 mb-0">{{ auth.currentUser?.email }}</p>
            </div>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            <v-btn 
              v-if="auth.currentUser?.is_manager" 
              @click="goTo('Manager')" 
              color="white"
              variant="outlined"
              class="mr-2"
              prepend-icon="mdi-briefcase"
            >
              Manager Panel
            </v-btn>
            <v-btn 
              v-if="auth.currentUser?.is_superuser" 
              @click="goTo('Admin')" 
              color="white"
              variant="outlined"
              class="mr-2"
              prepend-icon="mdi-shield-crown"
            >
              Admin Panel
            </v-btn>
            <v-btn 
              @click="logout" 
              color="white"
              variant="text"
              prepend-icon="mdi-logout"
              class="logout-btn"
            >
              Logout
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-6">
        <v-row class="mb-6">
          <v-col 
            cols="12" 
            sm="6" 
            md="3" 
            v-for="stat in statsWithIcons" 
            :key="stat.label"
          >
            <v-card 
              class="pa-4" 
              elevation="2"
              rounded="lg"
            >
              <v-row align="center" no-gutters>
                <v-col cols="auto">
                  <v-avatar 
                    :color="stat.color" 
                    size="56"
                    rounded="lg"
                  >
                    <v-icon 
                      color="white" 
                      size="28"
                    >
                      {{ stat.icon }}
                    </v-icon>
                  </v-avatar>
                </v-col>
                <v-col class="ml-4">
                  <div class="text-h4 font-weight-bold">{{ stat.label === 'Ruolo' ? 'Manager' : stat.value }}</div>
                  <div class="text-body-2 text-grey-darken-1">{{ stat.label }}</div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-6">
          <v-col>
            <v-card elevation="2" rounded="lg">
              <v-card-title class="d-flex align-center bg-green-lighten-5">
                <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
                <span>Ferie/Permessi Futuri Approvati</span>
                <v-chip 
                  color="success" 
                  variant="tonal" 
                  size="small"
                  class="ml-2"
                >
                  {{ approvedFuture.length }}
                </v-chip>
              </v-card-title>
              <v-card-text>
                <v-data-table
                  :items="approvedFuture"
                  :headers="futureHeaders"
                  :loading="loading"
                  density="comfortable"
                  hover
                  class="elevation-0"
                >
                  <template v-slot:item.type="{ item }">
                    <v-chip 
                      :color="item.type === 'leave' ? 'primary' : 'orange'" 
                      variant="tonal"
                      size="small"
                    >
                      {{ item.type === 'leave' ? '🏖️ Ferie' : '📋 Permesso' }}
                    </v-chip>
                  </template>
                  <template v-slot:item.start_date="{ item }">
                    {{ formatDate(item.start_date) }}
                  </template>
                  <template v-slot:item.end_date="{ item }">
                    {{ formatDate(item.end_date) }}
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-6">
          <v-col>
            <v-card elevation="2" rounded="lg">
              <v-card-title class="d-flex align-center bg-blue-lighten-5">
                <v-icon color="primary" class="mr-2">mdi-plus-circle</v-icon>
                <span>Nuova Richiesta</span>
              </v-card-title>
              <v-card-text class="pa-6">
                <v-form @submit.prevent="submitRequest">
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-select
                        v-model="type"
                        :items="typeOptionsFormatted"
                        item-title="label"
                        item-value="value"
                        label="Tipo di richiesta"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-format-list-bulleted"
                        required
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="startDate"
                        label="Data e Ora Inizio"
                        type="datetime-local"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-calendar-start"
                        required
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="endDate"
                        label="Data e Ora Fine"
                        type="datetime-local"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-calendar-end"
                        required
                      />
                    </v-col>
                  </v-row>
                  <v-btn 
                    type="submit" 
                    color="primary"
                    size="large"
                    prepend-icon="mdi-send"
                    class="mt-2"
                  >
                    Invia Richiesta
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-card elevation="2" rounded="lg">
              <v-card-title class="d-flex align-center bg-grey-lighten-3">
                <v-icon color="info" class="mr-2">mdi-history</v-icon>
                <span>Storico Richieste</span>
                <v-chip 
                  color="info" 
                  variant="tonal" 
                  size="small"
                  class="ml-2"
                >
                  {{ requests.length }}
                </v-chip>
              </v-card-title>
              <v-card-text>
                <v-data-table
                  :items="sortedRequests"
                  :headers="historyHeaders"
                  :loading="loading"
                  density="comfortable"
                  hover
                  class="elevation-0"
                >
                  <template v-slot:item.type="{ item }">
                    <v-chip 
                      :color="item.type === 'leave' ? 'primary' : 'orange'" 
                      variant="tonal"
                      size="small"
                    >
                      {{ item.type === 'leave' ? '🏖️ Ferie' : '📋 Permesso' }}
                    </v-chip>
                  </template>
                  <template v-slot:item.status="{ item }">
                    <v-chip 
                      :color="getStatusColor(item.status)" 
                      variant="tonal"
                      size="small"
                    >
                      {{ getStatusLabel(item.status) }}
                    </v-chip>
                  </template>
                  <template v-slot:item.start_date="{ item }">
                    {{ formatDate(item.start_date) }}
                  </template>
                  <template v-slot:item.end_date="{ item }">
                    {{ formatDate(item.end_date) }}
                  </template>
                  <template v-slot:item.created_at="{ item }">
                    {{ formatDate(item.created_at) }}
                  </template>
                  <template v-slot:item.rejection_reason="{ item }">
                    <v-tooltip v-if="item.rejection_reason" location="top">
                      <template v-slot:activator="{ props }">
                        <v-icon 
                          v-bind="props" 
                          color="error"
                          size="small"
                        >
                          mdi-information
                        </v-icon>
                      </template>
                      <span>{{ item.rejection_reason }}</span>
                    </v-tooltip>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { TimeOffRequest } from '@/types';

export default defineComponent({
  name: 'Dashboard',
  setup() {
    const auth = useAuthStore();
    const requests = ref<TimeOffRequest[]>([]);
    const loading = ref(true);
    const startDate = ref('');
    const endDate = ref('');
    const type = ref<'leave' | 'permit'>('leave');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const fetchRequests = async () => {
      if (!auth.token) return;
      loading.value = true;
      try {
        const res = await fetch(`${API_URL}/users/me/requests`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch requests');
        requests.value = await res.json();
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchRequests);

    const submitRequest = async () => {
      if (!auth.token) return;
      try {
        const res = await fetch(`${API_URL}/users/me/requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            start_date: startDate.value,
            end_date: endDate.value,
            type: type.value,
          }),
        });
        if (!res.ok) throw new Error('Failed to create request');
        const newReq = await res.json();
        requests.value.push(newReq);
        startDate.value = '';
        endDate.value = '';
        type.value = 'leave';
      } catch (err) {
        alert('Errore durante la creazione della richiesta');
      }
    };

    const approvedFuture = computed(() =>
      requests.value.filter(
        (r) =>
          r.status === 'approved' && new Date(r.start_date) > new Date()
      )
    );

    const stats = computed(() => [
      { label: 'Totale Richieste', value: requests.value.length },
      {
        label: 'Approvate',
        value: requests.value.filter((r) => r.status === 'approved').length,
      },
      {
        label: 'In Attesa',
        value: requests.value.filter((r) => r.status === 'pending').length,
      },
      auth.currentUser?.is_manager
        ? { label: 'Ruolo', value: 'Manager' }
        : null,
    ].filter(Boolean));

    const statsWithIcons = computed(() => {
      const items = [
        { 
          label: 'Totale Richieste', 
          value: requests.value.length,
          icon: 'mdi-calendar-check',
          color: 'blue'
        },
        {
          label: 'Approvate',
          value: requests.value.filter((r) => r.status === 'approved').length,
          icon: 'mdi-check-circle',
          color: 'success'
        },
        {
          label: 'In Attesa',
          value: requests.value.filter((r) => r.status === 'pending').length,
          icon: 'mdi-clock-outline',
          color: 'warning'
        }
      ];
      
      if (auth.currentUser?.is_manager) {
        items.push({ 
          label: 'Ruolo', 
          value: 1,
          icon: 'mdi-briefcase',
          color: 'primary'
        });
      }
      
      return items;
    });

    const futureHeaders = [
      { title: 'Tipo', key: 'type' },
      { title: 'Data Inizio', key: 'start_date' },
      { title: 'Data Fine', key: 'end_date' },
    ];

    const historyHeaders = [
      { title: 'Tipo', key: 'type' },
      { title: 'Data Inizio', key: 'start_date' },
      { title: 'Data Fine', key: 'end_date' },
      { title: 'Stato', key: 'status' },
      { title: 'Data Richiesta', key: 'created_at' },
      { title: '', key: 'rejection_reason', sortable: false },
    ];

    const sortedRequests = computed(() =>
      [...requests.value].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
    );

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Buongiorno';
      if (hour < 18) return 'Buon pomeriggio';
      return 'Buonasera';
    };

    const greeting = computed(() => getGreeting());

    const userName = computed(() => {
      if (auth.currentUser?.full_name && auth.currentUser.full_name.trim() !== '') {
        return auth.currentUser.full_name;
      }
      
      const emailName = auth.currentUser?.email?.split('@')[0] || '';
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    });

    const logout = async () => {
      await auth.logout();
      window.location.href = '/login';
    };

    const goTo = (name: string) => {
      window.location.href = name === 'Manager' ? '/manager' : '/admin';
    };

    const typeOptions = [
      { label: '🏖️ Ferie', value: 'leave' },
      { label: '📋 Permesso', value: 'permit' },
    ];

    const typeOptionsFormatted = [
      { label: '🏖️ Ferie', value: 'leave' },
      { label: '📋 Permesso', value: 'permit' },
    ];

    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'approved': return 'success';
        case 'pending': return 'warning';
        case 'rejected': return 'error';
        default: return 'grey';
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'approved': return '✅ Approvata';
        case 'pending': return '⏳ In Attesa';
        case 'rejected': return '❌ Rifiutata';
        default: return status;
      }
    };

    return {
      auth,
      requests,
      loading,
      startDate,
      endDate,
      type,
      approvedFuture,
      stats,
      statsWithIcons,
      futureHeaders,
      historyHeaders,
      sortedRequests,
      greeting,
      userName,
      logout,
      goTo,
      typeOptions,
      typeOptionsFormatted,
      submitRequest,
      formatDate,
      getStatusColor,
      getStatusLabel,
    };
  },
});
</script>

<style scoped>
:deep(.v-data-table) {
  font-size: 0.875rem;
}

:deep(.v-app-bar) {
  box-shadow: 0 2px 4px rgba(0,0,0,0.08) !important;
}

:deep(.v-card) {
  transition: all 0.3s ease;
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
}

:deep(.v-chip) {
  font-weight: 600;
}

.text-white-70 {
  opacity: 0.85;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.v-app-bar .v-btn--variant-outlined) {
  border-color: rgba(255, 255, 255, 0.5);
}

:deep(.v-app-bar .v-btn--variant-outlined:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
}
</style>
