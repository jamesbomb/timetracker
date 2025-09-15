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
                <v-icon color="white" class="mr-2">mdi-shield-crown</v-icon>
                Pannello Amministratore
              </h2>
              <p class="text-caption text-white-70 mb-0">Gestione unità e utenti</p>
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
        <v-row>
          <v-col cols="12" md="4">
            <v-card elevation="2" rounded="lg" class="h-100">
              <v-card-title class="bg-primary-lighten-5">
                <v-icon color="primary" class="mr-2">mdi-office-building</v-icon>
                Gestione Unità
              </v-card-title>
              
              <v-card-text>
                <v-form @submit.prevent="createUnit">
                  <v-text-field
                    v-model="newUnitName"
                    label="Nome nuova unità"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-plus"
                    clearable
                    required
                  />
                  <v-btn 
                    type="submit" 
                    color="primary"
                    block
                    size="large"
                    prepend-icon="mdi-plus-circle"
                  >
                    Crea Unità
                  </v-btn>
                </v-form>
              </v-card-text>

              <v-divider />

              <v-card-text>
                <v-list density="comfortable">
                  <v-list-subheader>
                    UNITÀ ESISTENTI ({{ units.length }})
                  </v-list-subheader>
                  <v-list-item
                    v-for="unit in units"
                    :key="unit.id"
                    rounded="lg"
                    class="mb-2 draggable-unit"
                    draggable="true"
                    @dragstart="handleDragStart(unit, $event)"
                    @dragend="handleDragEnd"
                  >
                    <template v-slot:prepend>
                      <v-avatar color="primary" variant="tonal">
                        <v-icon>mdi-domain</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{ unit.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      ID: {{ unit.id }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="8">
            <v-card elevation="2" rounded="lg">
              <v-card-title class="bg-blue-lighten-5">
                <v-icon color="blue" class="mr-2">mdi-account-group</v-icon>
                Gestione Utenti
                <v-chip 
                  color="blue" 
                  variant="tonal" 
                  size="small"
                  class="ml-2"
                >
                  {{ filteredUsers.length }}/{{ users.length }}
                </v-chip>
              </v-card-title>

              <v-card-text>
                <v-text-field
                  v-model="searchTerm"
                  label="🔍 Cerca per email o nome"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  class="mb-4"
                />

                <v-expansion-panels variant="accordion" class="user-panels">
                  <v-expansion-panel
                    v-for="user in filteredUsers"
                    :key="user.id"
                    elevation="2"
                    class="mb-2"
                  >
                    <v-expansion-panel-title>
                      <v-row align="center" no-gutters>
                        <v-col cols="auto">
                          <v-avatar 
                            :color="user.is_manager ? 'success' : 'grey'" 
                            size="40"
                            class="mr-3"
                          >
                            <v-icon color="white">
                              {{ user.is_manager ? 'mdi-briefcase' : 'mdi-account' }}
                            </v-icon>
                          </v-avatar>
                        </v-col>
                        <v-col>
                          <div class="font-weight-medium">
                            {{ user.full_name || user.email }}
                          </div>
                          <div class="text-caption text-grey-darken-1">
                            {{ user.email }}
                          </div>
                        </v-col>
                        <v-col cols="auto">
                          <v-chip 
                            v-if="user.is_superuser" 
                            color="purple" 
                            variant="tonal"
                            size="small"
                            class="mr-2"
                          >
                            Admin
                          </v-chip>
                          <v-chip 
                            v-if="user.is_manager" 
                            color="success" 
                            variant="tonal"
                            size="small"
                          >
                            Manager
                          </v-chip>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-title>
                    
                    <v-expansion-panel-text>
                      <v-container fluid>
                        <v-row>
                          <v-col cols="12">
                            <v-switch
                              v-model="editState[user.id].is_manager"
                              label="Manager"
                              color="success"
                              hide-details
                              density="comfortable"
                            />
                          </v-col>
                        </v-row>

                        <v-row>
                          <v-col cols="12">
                            <v-switch
                              v-model="useDragAndDrop"
                              label="Modalità Drag & Drop"
                              color="primary"
                              hide-details
                              density="compact"
                              class="mb-3"
                            />
                          </v-col>
                        </v-row>

                        <v-row v-if="useDragAndDrop" class="mt-2">
                          <v-col cols="12" md="6">
                            <div class="unit-section">
                              <label class="text-subtitle-2 mb-2 d-block">
                                <v-icon size="small" class="mr-1">mdi-office-building</v-icon>
                                Appartiene a:
                              </label>
                              <div 
                                class="drop-zone"
                                :class="{ 'drag-over': dropTarget === `member-${user.id}` }"
                                @dragover.prevent="handleDragOver(`member-${user.id}`)"
                                @dragleave="handleDragLeave"
                                @drop="handleDropOnMember(user.id, $event)"
                              >
                                <div v-if="editState[user.id].member_unit_ids.length === 0" class="drop-zone-empty">
                                  Trascina qui le unità
                                </div>
                                <v-chip
                                  v-for="unitId in editState[user.id].member_unit_ids"
                                  :key="unitId"
                                  color="primary"
                                  variant="tonal"
                                  size="small"
                                  closable
                                  @click:close="removeFromMember(user.id, unitId)"
                                  class="ma-1"
                                >
                                  {{ units.find(u => u.id === unitId)?.name }}
                                </v-chip>
                              </div>
                            </div>
                          </v-col>

                          <v-col cols="12" md="6">
                            <div class="unit-section">
                              <label class="text-subtitle-2 mb-2 d-block">
                                <v-icon size="small" class="mr-1">mdi-briefcase</v-icon>
                                Gestisce:
                              </label>
                              <div 
                                class="drop-zone"
                                :class="{ 
                                  'drag-over': dropTarget === `manager-${user.id}`,
                                  'disabled': !editState[user.id].is_manager
                                }"
                                @dragover.prevent="editState[user.id].is_manager && handleDragOver(`manager-${user.id}`)"
                                @dragleave="handleDragLeave"
                                @drop="editState[user.id].is_manager && handleDropOnManaged(user.id, $event)"
                              >
                                <div v-if="editState[user.id].managed_unit_ids.length === 0" class="drop-zone-empty">
                                  {{ editState[user.id].is_manager ? 'Trascina qui le unità' : 'Abilita Manager per gestire unità' }}
                                </div>
                                <v-chip
                                  v-for="unitId in editState[user.id].managed_unit_ids"
                                  :key="unitId"
                                  color="success"
                                  variant="tonal"
                                  size="small"
                                  closable
                                  @click:close="removeFromManaged(user.id, unitId)"
                                  class="ma-1"
                                >
                                  {{ units.find(u => u.id === unitId)?.name }}
                                </v-chip>
                              </div>
                            </div>
                          </v-col>
                        </v-row>

                        <v-row v-else class="mt-2">
                          <v-col cols="12" md="6">
                            <v-select
                              v-model="editState[user.id].member_unit_ids"
                              :items="units"
                              item-title="name"
                              item-value="id"
                              label="Appartiene a"
                              variant="outlined"
                              density="comfortable"
                              multiple
                              chips
                              closable-chips
                              prepend-inner-icon="mdi-office-building"
                            >
                              <template v-slot:chip="{ item, props }">
                                <v-chip 
                                  v-bind="props" 
                                  color="primary" 
                                  variant="tonal"
                                  size="small"
                                >
                                  {{ item.title }}
                                </v-chip>
                              </template>
                            </v-select>
                          </v-col>

                          <v-col cols="12" md="6">
                            <v-select
                              v-model="editState[user.id].managed_unit_ids"
                              :items="units"
                              item-title="name"
                              item-value="id"
                              label="Gestisce"
                              variant="outlined"
                              density="comfortable"
                              multiple
                              chips
                              closable-chips
                              prepend-inner-icon="mdi-briefcase"
                              :disabled="!editState[user.id].is_manager"
                            >
                              <template v-slot:chip="{ item, props }">
                                <v-chip 
                                  v-bind="props" 
                                  color="success" 
                                  variant="tonal"
                                  size="small"
                                >
                                  {{ item.title }}
                                </v-chip>
                              </template>
                            </v-select>
                          </v-col>
                        </v-row>

                        <v-row class="mt-4">
                          <v-col>
                            <v-btn 
                              color="primary" 
                              @click="updateUser(user.id)"
                              block
                              size="large"
                              prepend-icon="mdi-content-save"
                            >
                              Salva Modifiche
                            </v-btn>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

                <v-card 
                  v-if="filteredUsers.length === 0" 
                  variant="tonal"
                  color="grey"
                  class="pa-8 text-center"
                >
                  <v-icon size="64" color="grey">mdi-account-search</v-icon>
                  <h3 class="text-h6 mt-4">Nessun utente trovato</h3>
                  <p class="text-body-2 text-grey">
                    Prova a modificare i criteri di ricerca
                  </p>
                </v-card>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

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
import { defineComponent, onMounted, reactive, ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import type { Unit, UserAdmin } from '@/types';

export default defineComponent({
  name: 'Admin',
  setup() {
    const auth = useAuthStore();
    const { token } = auth;

    const units = ref<Unit[]>([]);
    const users = ref<UserAdmin[]>([]);
    const newUnitName = ref('');
    const searchTerm = ref('');
    const editState = reactive<{
      [userId: number]: {
        is_manager: boolean;
        managed_unit_ids: number[];
        member_unit_ids: number[];
      };
    }>({});

    const snackbar = ref(false);
    const snackbarText = ref('');
    const snackbarColor = ref('success');
    
    const draggedUnit = ref<Unit | null>(null);
    const dropTarget = ref<string | null>(null);
    const useDragAndDrop = ref(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const fetchUnits = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/admin/units`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          units.value = await res.json();
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchUsers = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          users.value = data;
          data.forEach((user: UserAdmin) => {
            editState[user.id] = {
              is_manager: user.is_manager || false,
              managed_unit_ids: user.managed_units?.map((u) => u.id) || [],
              member_unit_ids: user.units?.map((u) => u.id) || [],
            };
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    const createUnit = async () => {
      if (!token || !newUnitName.value.trim()) return;
      try {
        const res = await fetch(`${API_URL}/admin/units`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newUnitName.value }),
        });
        if (res.ok) {
          const newUnit = await res.json();
          units.value.push(newUnit);
          newUnitName.value = '';
          showSnackbar('Unità creata con successo', 'success');
        } else {
          showSnackbar('Errore nella creazione dell\'unità', 'error');
        }
      } catch (err) {
        console.error(err);
        showSnackbar('Errore nella creazione dell\'unità', 'error');
      }
    };

    const updateUser = async (userId: number) => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editState[userId]),
        });
        if (res.ok) {
          const updatedUser = await res.json();
          const index = users.value.findIndex((u) => u.id === userId);
          if (index >= 0) {
            users.value[index] = updatedUser;
          }
          showSnackbar('Utente aggiornato con successo', 'success');
        } else {
          showSnackbar('Errore nell\'aggiornamento dell\'utente', 'error');
        }
      } catch (err) {
        console.error(err);
        showSnackbar('Errore nell\'aggiornamento dell\'utente', 'error');
      }
    };

    const filteredUsers = computed(() => {
      if (!searchTerm.value) return users.value;
      const term = searchTerm.value.toLowerCase();
      return users.value.filter((user) =>
        user.email.toLowerCase().includes(term) ||
        user.full_name?.toLowerCase().includes(term)
      );
    });

    const logout = async () => {
      await auth.logout();
      window.location.href = '/login';
    };

    const goTo = (name: string) => {
      window.location.href = name === 'Dashboard' ? '/dashboard' : '/admin';
    };

    const showSnackbar = (text: string, color: string) => {
      snackbarText.value = text;
      snackbarColor.value = color;
      snackbar.value = true;
    };
    
    const handleDragStart = (unit: Unit, event: DragEvent) => {
      draggedUnit.value = unit;
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/plain', unit.id.toString());
      }
      const target = event.target as HTMLElement;
      target.classList.add('dragging');
    };

    const handleDragEnd = (event: DragEvent) => {
      const target = event.target as HTMLElement;
      target.classList.remove('dragging');
      draggedUnit.value = null;
      dropTarget.value = null;
    };

    const handleDragOver = (targetId: string) => {
      dropTarget.value = targetId;
    };

    const handleDragLeave = () => {
      dropTarget.value = null;
    };

    const handleDropOnMember = (userId: number, event: DragEvent) => {
      event.preventDefault();
      dropTarget.value = null;
      
      if (!draggedUnit.value) return;
      
      const state = editState[userId];
      if (!state.member_unit_ids.includes(draggedUnit.value.id)) {
        state.member_unit_ids.push(draggedUnit.value.id);
      }
    };

    const handleDropOnManaged = (userId: number, event: DragEvent) => {
      event.preventDefault();
      dropTarget.value = null;
      
      if (!draggedUnit.value) return;
      
      const state = editState[userId];
      if (!state.managed_unit_ids.includes(draggedUnit.value.id)) {
        state.managed_unit_ids.push(draggedUnit.value.id);
      }
    };

    const removeFromMember = (userId: number, unitId: number) => {
      const state = editState[userId];
      const index = state.member_unit_ids.indexOf(unitId);
      if (index > -1) {
        state.member_unit_ids.splice(index, 1);
      }
    };

    const removeFromManaged = (userId: number, unitId: number) => {
      const state = editState[userId];
      const index = state.managed_unit_ids.indexOf(unitId);
      if (index > -1) {
        state.managed_unit_ids.splice(index, 1);
      }
    };

    onMounted(() => {
      fetchUnits();
      fetchUsers();
    });

    return {
      units,
      users,
      newUnitName,
      searchTerm,
      editState,
      filteredUsers,
      createUnit,
      updateUser,
      logout,
      goTo,
      snackbar,
      snackbarText,
      snackbarColor,
      useDragAndDrop,
      draggedUnit,
      dropTarget,
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragLeave,
      handleDropOnMember,
      handleDropOnManaged,
      removeFromMember,
      removeFromManaged,
    };
  },
});
</script>

<style scoped>
:deep(.v-expansion-panel) {
  margin-bottom: 8px;
}

:deep(.v-expansion-panel-title) {
  padding: 16px !important;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}

:deep(.v-app-bar) {
  box-shadow: 0 2px 4px rgba(0,0,0,0.08) !important;
}

:deep(.v-card) {
  transition: all 0.3s ease;
}

.user-panels :deep(.v-expansion-panel) {
  border-radius: 8px !important;
  overflow: hidden;
}

.user-panels :deep(.v-expansion-panel-title) {
  background: white;
  border-radius: 8px;
}

.user-panels :deep(.v-expansion-panel--active .v-expansion-panel-title) {
  background: #f5f5f5;
}

.text-white-70 {
  opacity: 0.85;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.draggable-unit {
  cursor: move;
  transition: all 0.3s ease;
}

.draggable-unit:hover {
  background-color: #f5f5f5;
  transform: translateX(4px);
}

.draggable-unit.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.drop-zone {
  min-height: 80px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.drop-zone.drag-over {
  border-color: #4caf50;
  background-color: #e8f5e9;
  transform: scale(1.02);
}

.drop-zone.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f5f5f5;
}

.drop-zone-empty {
  color: #9e9e9e;
  text-align: center;
  padding: 20px;
  font-size: 0.875rem;
}

.unit-section {
  margin-bottom: 1rem;
}

:deep(.v-app-bar .v-btn--variant-outlined) {
  border-color: rgba(255, 255, 255, 0.5);
}

:deep(.v-app-bar .v-btn--variant-outlined:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
}
</style>
