import VueNotifications from 'vue-notifications';

// Include mini-toaster (or any other UI-notification library)
import miniToastr from 'mini-toastr';

// We shall setup types of the messages. ('error' type - red and 'success' - green in mini-toastr)
const toastTypes = {
  success: 'success',
  error: 'error',
  info: 'info',
  warn: 'warn',
};

// This step requires only for mini-toastr, just an initialization

miniToastr.init({
  types: toastTypes,
  appendTarget: document.body,
});

miniToastr.setIcon('error', 'i', { class: 'fas fa-exclamation-circle' });
miniToastr.setIcon('info', 'i', { class: 'fa fa-info-circle' });
miniToastr.setIcon('success', 'i', { class: 'fas fa-check-circle' });

// Here we are seting up messages output to `mini-toastr`
// This mean that in case of 'success' message we will call miniToastr.success(message, title, timeout, cb)
// In case of 'error' we will call miniToastr.error(message, title, timeout, cb)
// and etc.
function toast ({ title, message, type, timeout, cb }: any) {
  return miniToastr[type](message, title, timeout, cb);
}

// Here we map vue-notifications method to function abowe (to mini-toastr)
// By default vue-notifications can have 4 methods: 'success', 'error', 'info' and 'warn'
// But you can specify whatever methods you want.
// If you won't specify some method here, output would be sent to the browser's console
const options = {
  success: toast,
  error: toast,
  info: toast,
  warn: toast,
};

// Activate plugin
// VueNotifications have auto install but if we want to specify options we've got to do it manually.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueNotifications, options);
});
