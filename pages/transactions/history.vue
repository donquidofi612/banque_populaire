<template>
  <PageHeader :propData="dataToPass" />

  <!-- Start::row-1 - Filtres de recherche -->
  <div class="row mb-4">
    <div class="col-md-4 mb-3">
      <input type="text" class="form-control" v-model="searchQuery" placeholder="Rechercher une transaction...">
    </div>
    <div class="col-md-4 mb-3">
      <select class="form-select" v-model="selectedType">
        <option value="">Tous les types</option>
        <option value="Débit">Débit</option>
        <option value="Crédit">Crédit</option>
      </select>
    </div>
    <div class="col-md-4 mb-3">
      <input type="date" class="form-control" v-model="selectedDate">
    </div>
  </div>
  <!-- End::row-1 -->

  <!-- Start::row-2 - Tableau des Transactions avec Pagination -->
  <div class="row">
    <div class="col-12">
      <div class="card custom-card shadow-lg">
        <div class="card-header">
          <div class="card-title">
            Historique Complet des Transactions
          </div>
          <div class="card-options">
            <button class="btn btn-primary" @click="filterTransactions">Rechercher</button>
            <button class="btn btn-secondary ms-2" @click="resetFilters">Réinitialiser</button>
          </div>
        </div>
        <div class="card-body p-0">
          <table class="table text-nowrap table-hover mb-0">
            <thead>
            <tr>
              <th @click="sortTable('date')">Date <span :class="getSortIcon('date')"></span></th>
              <th @click="sortTable('description')">Description <span :class="getSortIcon('description')"></span></th>
              <th @click="sortTable('type')">Type <span :class="getSortIcon('type')"></span></th>
              <th @click="sortTable('amount')">Montant <span :class="getSortIcon('amount')"></span></th>
              <th @click="sortTable('balanceAfter')">Solde Après Transaction <span :class="getSortIcon('balanceAfter')"></span></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="transaction in paginatedTransactions" :key="transaction.id">
              <td>{{ transaction.date }}</td>
              <td>{{ transaction.description }}</td>
              <td :class="transaction.type === 'Crédit' ? 'text-success' : 'text-danger'">
                {{ transaction.type }}
              </td>
              <td :class="transaction.type === 'Crédit' ? 'text-success' : 'text-danger'">
                {{ transaction.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}
              </td>
              <td>{{ transaction.balanceAfter.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
          <div>Affichage de {{ start }} à {{ end }} sur {{ filteredTransactions.length }} transactions</div>
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="javascript:void(0);" @click="previousPage">Précédent</a>
            </li>
            <li class="page-item" :class="{ active: currentPage === page }" v-for="page in totalPages" :key="page">
              <a class="page-link" href="javascript:void(0);" @click="goToPage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="javascript:void(0);" @click="nextPage">Suivant</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <!-- End::row-2 -->
</template>

<script lang="ts">
import PageHeader from "@/components/common/pageheader.vue";
import auth from '@/middleware/auth';
import { ref, computed } from 'vue';

export default {
  setup() {
    definePageMeta({
      middleware: [auth],
    });

    // Transactions complètes
    const transactions = ref([
      { id: 1, date: '02/10/2023', description: 'Paiement en ligne', type: 'Débit', amount: -500, balanceAfter: 14500 },
      { id: 2, date: '01/10/2023', description: 'Salaire', type: 'Crédit', amount: 7000, balanceAfter: 15000 },
      { id: 3, date: '30/09/2023', description: 'Achat Boutique', type: 'Débit', amount: -200, balanceAfter: 8000 },
      { id: 4, date: '29/09/2023', description: 'Virement', type: 'Crédit', amount: 500, balanceAfter: 8200 },
      { id: 5, date: '28/09/2023', description: 'Retrait DAB', type: 'Débit', amount: -1000, balanceAfter: 7700 },
      // Ajouter plus de transactions pour illustrer l'historique complet
    ]);

    // Gestion des filtres
    const searchQuery = ref('');
    const selectedType = ref('');
    const selectedDate = ref('');

    // Tri des transactions
    const sortColumn = ref('');
    const sortDirection = ref('asc');

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = 10;

    // Filtrage des transactions
    const filteredTransactions = computed(() => {
      let filtered = transactions.value;

      // Filtrage par recherche
      if (searchQuery.value) {
        filtered = filtered.filter(transaction => {
          return transaction.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
              transaction.date.includes(searchQuery.value);
        });
      }

      // Filtrage par type
      if (selectedType.value) {
        filtered = filtered.filter(transaction => transaction.type === selectedType.value);
      }

      // Filtrage par date
      if (selectedDate.value) {
        filtered = filtered.filter(transaction => transaction.date === selectedDate.value);
      }

      // Tri des transactions
      if (sortColumn.value) {
        filtered.sort((a, b) => {
          let comparison = 0;
          if (a[sortColumn.value] > b[sortColumn.value]) {
            comparison = 1;
          } else if (a[sortColumn.value] < b[sortColumn.value]) {
            comparison = -1;
          }
          return sortDirection.value === 'asc' ? comparison : -comparison;
        });
      }

      return filtered;
    });

    // Calcul des pages totales
    const totalPages = computed(() => {
      return Math.ceil(filteredTransactions.value.length / itemsPerPage);
    });

    // Calcul de l'index de début et de fin pour la pagination
    const start = computed(() => {
      return (currentPage.value - 1) * itemsPerPage + 1;
    });

    const end = computed(() => {
      return Math.min(currentPage.value * itemsPerPage, filteredTransactions.value.length);
    });

    // Transactions pour la page actuelle
    const paginatedTransactions = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredTransactions.value.slice(startIndex, endIndex);
    });

    // Fonctions de pagination
    const goToPage = (page) => {
      currentPage.value = page;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    // Fonction de tri
    const sortTable = (column) => {
      if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn.value = column;
        sortDirection.value = 'asc';
      }
    };

    // Récupérer l'icône de tri
    const getSortIcon = (column) => {
      if (sortColumn.value === column) {
        return sortDirection.value === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
      }
      return '';
    };

    // Fonction de recherche
    const filterTransactions = () => {
      // Cette fonction est appelée lors de la recherche.
      // Les transactions sont déjà filtrées via la propriété calculée `filteredTransactions`.
    };

    // Réinitialisation des filtres
    const resetFilters = () => {
      searchQuery.value = '';
      selectedType.value = '';
      selectedDate.value = '';
      currentPage.value = 1;
    };

    const dataToPass = {
      current: "Historique complet",
      list: ['Transactions', 'Historique complet']
    };

    return {
      dataToPass,
      transactions,
      searchQuery,
      selectedType,
      selectedDate,
      sortColumn,
      sortDirection,
      currentPage,
      itemsPerPage,
      filteredTransactions,
      paginatedTransactions,
      totalPages,
      start,
      end,
      goToPage,
      nextPage,
      previousPage,
      sortTable,
      getSortIcon,
      filterTransactions,
      resetFilters
    };
  },
  components: {
    PageHeader
  },
};
</script>

<style scoped>
/* Styles communs pour les cartes d'information */
.transaction-card {
  border-radius: 12px;
  padding: 15px;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
}

.card-body {
  padding: 20px;
}

.icon-container {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background-color: #f8f9fa;
  border-radius: 50%;
}

.shadow-lg {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.text-primary {
  color: #007bff !important;
}

/* Styles supplémentaires */
.table th, .table td {
  padding: 10px;
  font-size: 0.9rem;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.card-options {
  display: flex;
  align-items: center;
}

.card-options .btn {
  margin-left: 10px;
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}
</style>
