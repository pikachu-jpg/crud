<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar class="pink-toolbar">
        <ion-title>
          <div class="brand">
            <span class="brand-icon">🍓</span>
            <span>Rest-O</span>
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="resto-content">
      <div class="container">
        <!-- Welcome Section -->
        <section class="welcome-section">
          <div>
            <p class="eyebrow">WELCOME TO REST-O 20</p>
            <h1>Good food.<br /><span>Good mood.</span></h1>
            <p class="welcome-description">
              Manage your restaurant menu in one place.
            </p>
          </div>

          <div class="welcome-illustration">🍰</div>
        </section>

        <!-- Statistics -->
        <section class="stats-card">
          <div class="stat-icon">🍽️</div>
          <div>
            <p class="stat-label">Total Menu Items</p>
            <h2>{{ menuItems.length }}</h2>
          </div>
        </section>

        <!-- Menu Heading -->
        <section class="section-heading">
          <div>
            <p class="eyebrow">YOUR RESTAURANT</p>
            <h2>Menu Management</h2>
          </div>

          <ion-button class="add-button" @click="openAddForm">
            <ion-icon :icon="addOutline" slot="start" />
            Add
          </ion-button>
        </section>

        <!-- Search -->
        <ion-searchbar
          v-model="searchText"
          placeholder="Search menu..."
          class="custom-search"
          :debounce="200"
        />

        <!-- Loading -->
        <div v-if="loading" class="message-box">
          <ion-spinner name="crescent" color="danger" />
          <p>Loading menu...</p>
        </div>

        <!-- Error -->
        <div v-else-if="errorMessage" class="error-box">
          {{ errorMessage }}
        </div>

        <!-- Menu List -->
        <section v-else class="menu-list">
          <article
            v-for="item in filteredItems"
            :key="item.id"
            class="menu-card"
          >
            <div class="food-icon">
              {{ item.emoji || '🍽️' }}
            </div>

            <div class="menu-details">
              <h3>{{ item.name }}</h3>
              <p>
                {{ item.description || 'Delicious and freshly prepared.' }}
              </p>
              <span class="category-badge">{{ item.category }}</span>
              <strong>{{ formatPrice(item.price) }}</strong>
            </div>

            <div class="card-actions">
              <ion-button
                fill="clear"
                class="edit-button"
                aria-label="Edit menu item"
                @click="openEditForm(item)"
              >
                <ion-icon :icon="createOutline" />
              </ion-button>

              <ion-button
                fill="clear"
                class="delete-button"
                aria-label="Delete menu item"
                @click="confirmDelete(item)"
              >
                <ion-icon :icon="trashOutline" />
              </ion-button>
            </div>
          </article>

          <!-- Empty State -->
          <div v-if="filteredItems.length === 0" class="empty-state">
            <div class="empty-icon">🧁</div>
            <h3>No menu items found</h3>
            <p>Add your first menu item to get started.</p>
          </div>
        </section>

        <!-- Add/Edit Modal -->
        <ion-modal
          :is-open="showForm"
          @didDismiss="closeForm"
        >
          <ion-header>
            <ion-toolbar class="pink-toolbar">
              <ion-title>
                {{ isEditing ? 'Edit Menu Item' : 'Add Menu Item' }}
              </ion-title>

              <ion-buttons slot="end">
                <ion-button @click="closeForm">
                  Close
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content class="modal-content">
            <form class="menu-form" @submit.prevent="saveMenuItem">
              <!-- Name -->
              <ion-item>
                <ion-label position="stacked">
                  Food Name *
                </ion-label>

                <ion-input
                  v-model="form.name"
                  placeholder="e.g. Strawberry Cake"
                  required
                />
              </ion-item>

              <!-- Price -->
              <ion-item>
                <ion-label position="stacked">
                  Price (₱) *
                </ion-label>

                <ion-input
                  v-model="form.price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 150"
                  required
                />
              </ion-item>

              <!-- Description -->
              <ion-item>
                <ion-label position="stacked">
                  Description
                </ion-label>

                <ion-textarea
                  v-model="form.description"
                  placeholder="Describe your menu item..."
                  :auto-grow="true"
                />
              </ion-item>

              <!-- Category -->
              <ion-item>
                <ion-label position="stacked">
                  Category
                </ion-label>

                <ion-select
                  v-model="form.category"
                  placeholder="Select category"
                >
                  <ion-select-option value="Food">
                    Food
                  </ion-select-option>

                  <ion-select-option value="Drinks">
                    Drinks
                  </ion-select-option>

                  <ion-select-option value="Dessert">
                    Dessert
                  </ion-select-option>
                </ion-select>
              </ion-item>

              <!-- Emoji -->
              <ion-item>
                <ion-label position="stacked">
                  Food Icon
                </ion-label>

                <ion-select
                  v-model="form.emoji"
                  placeholder="Choose an emoji"
                >
                  <ion-select-option value="🍔">🍔 Burger</ion-select-option>
                  <ion-select-option value="🍕">🍕 Pizza</ion-select-option>
                  <ion-select-option value="🍝">🍝 Pasta</ion-select-option>
                  <ion-select-option value="🍟">🍟 Fries</ion-select-option>
                  <ion-select-option value="🥤">🥤 Drinks</ion-select-option>
                  <ion-select-option value="☕">☕ Coffee</ion-select-option>
                  <ion-select-option value="🍰">🍰 Cake</ion-select-option>
                  <ion-select-option value="🍩">🍩 Donut</ion-select-option>
                  <ion-select-option value="🍗">🍗 Chicken</ion-select-option>
                  <ion-select-option value="🍽️">🍽️ Other</ion-select-option>
                </ion-select>
              </ion-item>

              <!-- Save -->
              <ion-button
                expand="block"
                type="submit"
                class="save-button"
                :disabled="saving"
              >
                <ion-spinner
                  v-if="saving"
                  name="crescent"
                />

                <span v-else>
                  {{ isEditing ? 'Save Changes' : 'Add Menu Item' }}
                </span>
              </ion-button>

              <!-- Cancel -->
              <ion-button
                expand="block"
                fill="clear"
                color="medium"
                type="button"
                @click="closeForm"
              >
                Cancel
              </ion-button>
            </form>
          </ion-content>
        </ion-modal>

        <!-- Toast -->
        <ion-toast
          :is-open="showToast"
          :message="toastMessage"
          :duration="2500"
          position="bottom"
          @didDismiss="showToast = false"
          color="success"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
} from 'vue';

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSpinner,
  IonModal,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToast,
  alertController,
} from '@ionic/vue';

import {
  addOutline,
  createOutline,
  trashOutline,
} from 'ionicons/icons';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';

import { db } from '@/firebase';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  emoji: string;
}

const menuItems = ref<MenuItem[]>([]);
const searchText = ref('');

const loading = ref(true);
const saving = ref(false);

const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const errorMessage = ref('');

const showToast = ref(false);
const toastMessage = ref('');

const form = reactive({
  name: '',
  price: '' as string | number,
  description: '',
  category: 'Food',
  emoji: '🍽️',
});

let unsubscribe: (() => void) | undefined;

/* Search menu items */
const filteredItems = computed(() => {
  const search = searchText.value.trim().toLowerCase();

  if (!search) {
    return menuItems.value;
  }

  return menuItems.value.filter((item) => {
    return (
      item.name.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search)
    );
  });
});

/* Format Philippine peso */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(price);
}

/* Show notification */
function notify(message: string) {
  toastMessage.value = message;
  showToast.value = true;
}

/* Reset form */
function resetForm() {
  form.name = '';
  form.price = '';
  form.description = '';
  form.category = 'Food';
  form.emoji = '🍽️';

  editingId.value = null;
  isEditing.value = false;
}

/* Open Add form */
function openAddForm() {
  resetForm();
  showForm.value = true;
}

/* Open Edit form */
function openEditForm(item: MenuItem) {
  resetForm();

  isEditing.value = true;
  editingId.value = item.id;

  form.name = item.name;
  form.price = item.price;
  form.description = item.description;
  form.category = item.category || 'Food';
  form.emoji = item.emoji || '🍽️';

  showForm.value = true;
}

/* Close form */
function closeForm() {
  showForm.value = false;
  resetForm();
}

/* Add or Update menu item */
async function saveMenuItem() {
  const name = form.name.trim();
  const price = Number(form.price);

  if (!name) {
    notify('Please enter a menu item name.');
    return;
  }

  if (
    form.price === '' ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    notify('Please enter a valid price.');
    return;
  }

  saving.value = true;

  const menuData = {
    name,
    price,
    description: form.description.trim(),
    category: form.category,
    emoji: form.emoji,
  };

  try {
    if (isEditing.value && editingId.value) {
      await updateDoc(
        doc(db, 'menuItems', editingId.value),
        menuData,
      );

      notify('Menu item updated successfully!');
    } else {
      await addDoc(
        collection(db, 'menuItems'),
        {
          ...menuData,
          createdAt: new Date(),
        },
      );

      notify('Menu item added successfully!');
    }

    closeForm();
  } catch (error) {
    console.error('Error saving menu item:', error);

    notify(
      'Unable to save. Check your Firebase configuration and Firestore rules.',
    );
  } finally {
    saving.value = false;
  }
}

/* Confirm Delete */
async function confirmDelete(item: MenuItem) {
  const alert = await alertController.create({
    header: 'Delete Menu Item',
    message: `Are you sure you want to delete "${item.name}"?`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => {
          void deleteMenuItem(item);
        },
      },
    ],
  });

  await alert.present();
}

/* Delete menu item */
async function deleteMenuItem(item: MenuItem) {
  try {
    await deleteDoc(
      doc(db, 'menuItems', item.id),
    );

    notify('Menu item deleted successfully!');
  } catch (error) {
    console.error('Error deleting menu item:', error);
    notify('Unable to delete the menu item.');
  }
}

/* Read menu items in real time */
onMounted(() => {
  loading.value = true;
  errorMessage.value = '';

  unsubscribe = onSnapshot(
    collection(db, 'menuItems'),

    (snapshot) => {
      menuItems.value = snapshot.docs.map((document) => {
        const data = document.data();

        return {
          id: document.id,
          name: String(data.name ?? ''),
          price: Number(data.price ?? 0),
          description: String(data.description ?? ''),
          category: String(data.category ?? 'Food'),
          emoji: String(data.emoji ?? '🍽️'),
        };
      });

      loading.value = false;
    },

    (error) => {
      console.error('Error loading menu items:', error);

      errorMessage.value =
        'Could not load menu items. Check your Firebase configuration and Firestore security rules.';

      loading.value = false;
    },
  );
});

/* Clean up Firestore listener */
onUnmounted(() => {
  unsubscribe?.();
});
</script>

<style scoped>
/* Main background */
ion-content.resto-content {
  --background: #fff7fa;
}

/* Header */
.pink-toolbar {
  --background: #f6a6c1;
  --color: #54263b;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.brand-icon {
  font-size: 25px;
}

/* Main container */
.container {
  max-width: 760px;
  margin: 0 auto;
  padding: 20px 16px 40px;
}

/* Welcome section */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 25px 20px;
  border-radius: 25px;
  background: linear-gradient(135deg, #ffe0eb, #ffc2d7);
  color: #54263b;
  overflow: hidden;
}

.eyebrow {
  margin: 0 0 8px;
  color: #bc527a;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.welcome-section h1 {
  margin: 0;
  font-size: clamp(27px, 7vw, 37px);
  line-height: 1.15;
  font-weight: 900;
}

.welcome-section h1 span {
  color: #c04477;
}

.welcome-description {
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.welcome-illustration {
  font-size: clamp(48px, 13vw, 82px);
}

/* Statistics */
.stats-card {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 20px 0 28px;
  padding: 18px;
  background: #ffffff;
  border: 1px solid #ffe0eb;
  border-radius: 20px;
  box-shadow: 0 5px 20px #8b42630d;
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: #ffe5ef;
  font-size: 26px;
}

.stat-label {
  margin: 0 0 4px;
  color: #93677a;
  font-size: 13px;
}

.stats-card h2 {
  margin: 0;
  color: #b83f70;
  font-size: 28px;
  font-weight: 900;
}

/* Menu heading */
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.section-heading .eyebrow {
  margin-bottom: 5px;
}

.section-heading h2 {
  margin: 0;
  color: #54263b;
  font-size: 21px;
  font-weight: 800;
}

/* Buttons */
.add-button,
.save-button {
  --background: #d94f86;
  --background-hover: #bd3b70;
  --color: #ffffff;
  --border-radius: 13px;
  font-weight: 700;
}

.save-button {
  margin-top: 25px;
  height: 48px;
}

/* Search */
.custom-search {
  --background: #ffffff;
  --color: #000000;
  --border-radius: 15px;
  --box-shadow: none;
  --placeholder-color: #888888;
  --icon-color: #d94f86;
  padding: 0;
  margin-bottom: 16px;
}

/* Menu cards */
.menu-list {
  display: grid;
  gap: 13px;
}

.menu-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 15px 10px 15px 14px;
  border: 1px solid #f8e2eb;
  border-radius: 19px;
  background: #ffffff;
  box-shadow: 0 5px 18px #8b42630a;
}

.food-icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 55px;
  height: 55px;
  border-radius: 17px;
  background: #fff0f5;
  font-size: 29px;
}

.menu-details {
  flex: 1;
  min-width: 0;
}

.menu-details h3 {
  margin: 0 0 5px;
  color: #54263b;
  font-size: 15px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.menu-details p {
  margin: 0 0 7px;
  color: #987b88;
  font-size: 12px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.menu-details strong {
  display: block;
  margin-top: 7px;
  color: #c04477;
  font-size: 14px;
}

.category-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 20px;
  background: #ffe5ef;
  color: #a33161;
  font-size: 10px;
  font-weight: 700;
}

/* Edit and Delete */
.card-actions {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.edit-button {
  --color: #c04477;
  margin: 0;
}

.delete-button {
  --color: #d95365;
  margin: 0;
}

/* Empty state and loading */
.message-box,
.empty-state {
  padding: 35px 15px;
  text-align: center;
  color: #987b88;
}

.empty-icon {
  font-size: 48px;
}

.empty-state h3 {
  color: #54263b;
  font-size: 18px;
}

.empty-state p {
  font-size: 13px;
}

/* Error message */
.error-box {
  padding: 18px;
  border-radius: 14px;
  background: #fff0f0;
  color: #a32638;
  font-size: 14px;
  line-height: 1.6;
}

/* Modal */
.modal-content {
  --background: #fff7fa;
}

.menu-form {
  padding: 15px;
}

/* White fields with BLACK typed text */
.menu-form ion-item {
  --background: #ffffff;
  --border-radius: 13px;
  --border-color: #f2d5e1;
  --color: #000000;
  margin-bottom: 13px;
  border-radius: 13px;
}

.menu-form ion-label {
  color: #000000 !important;
  font-weight: 600;
}

/* Input text */
.menu-form ion-input {
  --color: #000000;
  --placeholder-color: #888888;
  --placeholder-opacity: 1;
  color: #000000;
}

/* Textarea text */
.menu-form ion-textarea {
  --color: #000000;
  --placeholder-color: #888888;
  --placeholder-opacity: 1;
  color: #000000;
}

/* Dropdown selected text */
.menu-form ion-select {
  --color: #000000;
  --placeholder-color: #888888;
  color: #000000;
}

.menu-form ion-select::part(text) {
  color: #000000;
}

.menu-form ion-select::part(placeholder) {
  color: #888888;
}

/* Responsive design */
@media (min-width: 600px) {
  .container {
    padding: 28px 24px 45px;
  }

  .welcome-section {
    padding: 32px;
  }

  .menu-card {
    padding: 17px;
  }

  .card-actions {
    flex-direction: row;
  }
}
</style>