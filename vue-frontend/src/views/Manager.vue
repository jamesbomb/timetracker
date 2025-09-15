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
              <h2 class="text-h5 font-weight-bold text-white">
                <v-icon color="white" class="mr-2">mdi-briefcase</v-icon>
                Pannello Manager
              </h2>
              <p class="text-caption text-white-70 mb-0">Gestione richieste del team</p>
            </div>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            <v-btn 
              @click="goTo('Dashboard')" 
              color="white"
              variant="outlined"
              class="mr-2"
              prepend-icon="mdi-view-dashboard"
            >
              Dashboard
            </v-btn>
            <v-btn
              v-if="currentUser?.is_superuser"
              @click="goTo('Admin')"
              color="white"
              variant="outlined"
              class="mr-2"
              prepend-icon="mdi-shield-crown"
            >
              Admin
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
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" rounded="lg" class="pa-4">
              <v-row align="center" no-gutters>
                <v-col cols="auto">
                  <v-avatar color="blue" size="56" rounded="lg">
                    <v-icon color="white" size="28">mdi-clipboard-list</v-icon>
                  </v-avatar>
                </v-col>
                <v-col class="ml-4">
                  <div class="text-h4 font-weight-bold">{{ requests.length }}</div>
                  <div class="text-body-2 text-grey-darken-1">Totale Richieste</div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" rounded="lg" class="pa-4">
              <v-row align="center" no-gutters>
                <v-col cols="auto">
                  <v-avatar color="warning" size="56" rounded="lg">
                    <v-icon color="white" size="28">mdi-clock-outline</v-icon>
                  </v-avatar>
                </v-col>
                <v-col class="ml-4">
                  <div class="text-h4 font-weight-bold">{{ pendingCount }}</div>
                  <div class="text-body-2 text-grey-darken-1">In Attesa</div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" rounded="lg" class="pa-4">
              <v-row align="center" no-gutters>
                <v-col cols="auto">
                  <v-avatar color="success" size="56" rounded="lg">
                    <v-icon color="white" size="28">mdi-check-circle</v-icon>
                  </v-avatar>
                </v-col>
                <v-col class="ml-4">
                  <div class="text-h4 font-weight-bold">{{ approvedCount }}</div>
                  <div class="text-body-2 text-grey-darken-1">Approvate</div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2" rounded="lg" class="pa-4">
              <v-row align="center" no-gutters>
                <v-col cols="auto">
                  <v-avatar color="error" size="56" rounded="lg">
                    <v-icon color="white" size="28">mdi-close-circle</v-icon>
                  </v-avatar>
                </v-col>
                <v-col class="ml-4">
                  <div class="text-h4 font-weight-bold">{{ rejectedCount }}</div>
                  <div class="text-body-2 text-grey-darken-1">Rifiutate</div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col>
            <v-tabs
              v-model="filter"
              bg-color="white"
              color="primary"
              grow
              show-arrows
            >
              <v-tab value="all">
                <v-icon start>mdi-all-inclusive</v-icon>
                Tutte
                <v-badge 
                  :content="requests.length" 
                  color="grey"
                  inline
                  class="ml-2"
                />
              </v-tab>
              <v-tab value="pending">
                <v-icon start>mdi-clock-outline</v-icon>
                In Attesa
                <v-badge 
                  :content="pendingCount" 
                  color="warning"
                  inline
                  class="ml-2"
                />
              </v-tab>
              <v-tab value="approved">
                <v-icon start>mdi-check-circle</v-icon>
                Approvate
                <v-badge 
                  :content="approvedCount" 
                  color="success"
                  inline
                  class="ml-2"
                />
              </v-tab>
              <v-tab value="rejected">
                <v-icon start>mdi-close-circle</v-icon>
                Rifiutate
                <v-badge 
                  :content="rejectedCount" 
                  color="error"
                  inline
                  class="ml-2"
                />
              </v-tab>
            </v-tabs>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-card elevation="2" rounded="lg">
              <v-data-table
                :headers="headers"
                :items="filteredRequests"
                :loading="loading"
                density="comfortable"
                hover
                class="elevation-0"
              >
                <template v-slot:item.user="{ item }">
                  <div>
                    <div class="font-weight-medium">{{ item.user?.full_name || item.user?.email }}</div>
                    <div class="text-caption text-grey">{{ item.user?.email }}</div>
                  </div>
                </template>
                
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

                <template v-slot:item.status="{ item }">
                  <v-chip 
                    :color="getStatusColor(item.status)" 
                    variant="tonal"
                    size="small"
                  >
                    {{ getStatusLabel(item.status) }}
                  </v-chip>
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

                <template v-slot:item.actions="{ item }">
                  <div v-if="item.status === 'pending'">
                    <v-btn
                      color="success"
                      variant="text"
                      icon
                      size="small"
                      @click="handleApprove(item.id)"
                      :loading="processingId === item.id"
                    >
                      <v-icon>mdi-check</v-icon>
                      <v-tooltip activator="parent" location="top">Approva</v-tooltip>
                    </v-btn>
                    <v-btn
                      color="error"
                      variant="text"
                      icon
                      size="small"
                      @click="handleReject(item.id)"
                      :loading="processingId === item.id"
                    >
                      <v-icon>mdi-close</v-icon>
                      <v-tooltip activator="parent" location="top">Rifiuta</v-tooltip>
                    </v-btn>
                  </div>
                  <div v-else class="text-caption text-grey">
                    {{ item.status === 'approved' ? 'Approvata' : 'Rifiutata' }}
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-dialog v-model="rejectDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon color="error" class="mr-2">mdi-close-circle</v-icon>
          Rifiuta Richiesta
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="rejectionReason"
            label="Motivo del rifiuto (obbligatorio)"
            variant="outlined"
            rows="3"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="rejectDialog = false"
          >
            Annulla
          </v-btn>
          <v-btn 
            color="error" 
            variant="flat"
            @click="confirmReject"
            :disabled="!rejectionReason.trim()"
          >
            Conferma Rifiuto
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
        >
          Chiudi
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import type { TimeOffRequest } from '@/types';

export default defineComponent({
  name: 'Manager',
  setup() {
    const auth = useAuthStore();
    const { currentUser, token } = auth;
    const requests = ref<TimeOffRequest[]>([]);
    const loading = ref(true);
    const processingId = ref<number | null>(null);
    const filter = ref<string>('pending');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const rejectDialog = ref(false);
    const rejectionReason = ref('');
    const rejectingId = ref<number | null>(null);

    const snackbar = ref(false);
    const snackbarText = ref('');
    const snackbarColor = ref('success');

    const fetchRequests = async () => {
      if (!token) return;
      loading.value = true;
      try {
        const res = await fetch(`${API_URL}/manager/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          requests.value = await res.json();
        }
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const handleApprove = async (requestId: number) => {
      if (!token) return;
      processingId.value = requestId;
      try {
        const res = await fetch(`${API_URL}/manager/requests/${requestId}/approve`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const updatedReq = await res.json();
          const index = requests.value.findIndex(r => r.id === requestId);
          if (index >= 0) {
            requests.value[index] = updatedReq;
          }
          showSnackbar('Richiesta approvata con successo', 'success');
        } else {
          showSnackbar('Errore nell\'approvazione della richiesta', 'error');
        }
      } catch (err) {
        console.error(err);
        showSnackbar('Errore nell\'approvazione della richiesta', 'error');
      } finally {
        processingId.value = null;
      }
    };

    const handleReject = (requestId: number) => {
      rejectingId.value = requestId;
      rejectionReason.value = '';
      rejectDialog.value = true;
    };

    const confirmReject = async () => {
      if (!token || !rejectingId.value || !rejectionReason.value.trim()) return;
      
      processingId.value = rejectingId.value;
      rejectDialog.value = false;
      
      try {
        const res = await fetch(`${API_URL}/manager/requests/${rejectingId.value}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rejection_reason: rejectionReason.value.trim() }),
        });
        if (res.ok) {
          const updatedReq = await res.json();
          const index = requests.value.findIndex(r => r.id === rejectingId.value);
          if (index >= 0) {
            requests.value[index] = updatedReq;
          }
          showSnackbar('Richiesta rifiutata', 'info');
        } else {
          showSnackbar('Errore nel rifiuto della richiesta', 'error');
        }
      } catch (err) {
        console.error(err);
        showSnackbar('Errore nel rifiuto della richiesta', 'error');
      } finally {
        processingId.value = null;
        rejectingId.value = null;
        rejectionReason.value = '';
      }
    };

    const pendingCount = computed(() => 
      requests.value.filter(r => r.status === 'pending').length
    );

    const approvedCount = computed(() => 
      requests.value.filter(r => r.status === 'approved').length
    );

    const rejectedCount = computed(() => 
      requests.value.filter(r => r.status === 'rejected').length
    );

    const filteredRequests = computed(() => {
      if (filter.value === 'all') return requests.value;
      return requests.value.filter(r => r.status === filter.value);
    });

    const headers = [
      { title: 'Dipendente', key: 'user' },
      { title: 'Tipo', key: 'type' },
      { title: 'Inizio', key: 'start_date' },
      { title: 'Fine', key: 'end_date' },
      { title: 'Stato', key: 'status' },
      { title: 'Richiesta', key: 'created_at' },
      { title: '', key: 'rejection_reason', sortable: false },
      { title: 'Azioni', key: 'actions', sortable: false },
    ];

    const logout = async () => {
      await auth.logout();
      window.location.href = '/login';
    };

    const goTo = (name: string) => {
      if (name === 'Dashboard') {
        window.location.href = '/dashboard';
      } else if (name === 'Admin') {
        window.location.href = '/admin';
      }
    };

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

    const showSnackbar = (text: string, color: string) => {
      snackbarText.value = text;
      snackbarColor.value = color;
      snackbar.value = true;
    };

    onMounted(fetchRequests);

    return {
      currentUser,
      requests,
      loading,
      processingId,
      filter,
      pendingCount,
      approvedCount,
      rejectedCount,
      filteredRequests,
      headers,
      handleApprove,
      handleReject,
      confirmReject,
      logout,
      goTo,
      formatDate,
      getStatusColor,
      getStatusLabel,
      rejectDialog,
      rejectionReason,
      snackbar,
      snackbarText,
      snackbarColor,
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

:deep(.v-tabs) {
  border-radius: 8px;
}

:deep(.v-tab) {
  font-weight: 600;
  text-transform: none;
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
