<template>
  <v-snackbar
    v-model="isVisible"
    :timeout="3000"
    :color="bgColor"
    location="bottom"
    rounded="pill"
  >
    {{ message }}
  </v-snackbar>
</template>

<script setup>
import { ref } from "vue";

const isVisible = ref(false);
const message = ref("");
const bgColor = ref("");

const showSnackbar = (msg, color = "primary") => {
  message.value = msg;
  bgColor.value = color;
  isVisible.value = true;
};

defineExpose({ showSnackbar });
</script>
