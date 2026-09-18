<template>
  <v-dialog
    v-model="isVisible"
    max-width="480"
    persistent
    :scrim="true"
    transition="dialog-transition"
    :z-index="10000"
  >
    <v-card class="subscription-dialog">
      <!-- Decorative top border -->
      <div class="dialog-top-border"></div>
      
      <!-- Crown Icon Container -->
      <div class="crown-container">
        <div class="crown-glow"></div>
        <v-icon size="64" color="#5b9cf5" class="crown-icon">mdi-crown</v-icon>
      </div>
      
      <!-- Content -->
      <div class="dialog-content">
        <h2 class="dialog-title">Unlock Premium Content</h2>
        <p class="dialog-subtitle">
          Subscribe to <span class="artist-name">{{ artistName }}</span>
        </p>
        <p class="dialog-description">
          Get unlimited access to exclusive videos, courses, and premium content
        </p>
        
        <!-- Benefits List -->
        <div class="benefits-list">
          <div class="benefit-item">
            <v-icon size="20" color="#5b9cf5">mdi-check-circle</v-icon>
            <span>Exclusive video content</span>
          </div>
          <div class="benefit-item">
            <v-icon size="20" color="#5b9cf5">mdi-check-circle</v-icon>
            <span>Premium courses & tutorials Discounts</span>
          </div>
          <div class="benefit-item">
            <v-icon size="20" color="#5b9cf5">mdi-check-circle</v-icon>
            <span>Support your favorite artist</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <v-card-actions class="dialog-actions">
        <v-btn
          variant="text"
          @click="handleCancel"
          class="cancel-btn"
        >
          Maybe Later
        </v-btn>
        <v-btn
          variant="elevated"
          @click="handleSubscribe"
          class="subscribe-btn"
        >
          <v-icon left size="20" class="mr-2">mdi-star</v-icon>
          Subscribe Now
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  artistName: {
    type: String,
    default: 'Artist'
  }
});

const emit = defineEmits(['update:modelValue', 'subscribe', 'cancel']);

const isVisible = ref(false);

watch(() => props.modelValue, (newVal) => {
  isVisible.value = newVal;
});

watch(isVisible, (newVal) => {
  emit('update:modelValue', newVal);
});

const handleSubscribe = () => {
  emit('subscribe');
  isVisible.value = false;
};

const handleCancel = () => {
  emit('cancel');
  isVisible.value = false;
};
</script>

<style scoped>
.subscription-dialog {
  background: linear-gradient(
    135deg,
    rgba(15, 15, 20, 0.98) 0%,
    rgba(20, 20, 30, 0.98) 100%
  );
  border-radius: 25px !important;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(91, 156, 245, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6),
              0 0 40px rgba(91, 156, 245, 0.1);
  animation: dialogEnter 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10001;
}

@keyframes dialogEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-top-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #030d31 0%, #040d21 100%);
  background-size: 200% 100%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Crown Icon Styling */
.crown-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0 20px;
  animation: crownFloat 3s ease-in-out infinite;
}

@keyframes crownFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.crown-glow {
  position: absolute;
  width: 100px;
  height: 100px;
  background: radial-gradient(
    circle,
    rgba(91, 156, 245, 0.3) 0%,
    rgba(91, 156, 245, 0.1) 40%,
    transparent 70%
  );
  border-radius: 50%;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.crown-icon {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 12px rgba(91, 156, 245, 0.5));
  animation: crownRotate 4s ease-in-out infinite;
}

@keyframes crownRotate {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

/* Content Styling */
.dialog-content {
  padding: 0 32px 24px;
  text-align: center;
}

.dialog-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dialog-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 8px;
  line-height: 1.5;
}

.artist-name {
  color: #5b9cf5;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(91, 156, 245, 0.4);
  display: inline-block;
  animation: artistNameGlow 2s ease-in-out infinite;
}

@keyframes artistNameGlow {
  0%, 100% {
    text-shadow: 0 0 20px rgba(91, 156, 245, 0.4);
  }
  50% {
    text-shadow: 0 0 30px rgba(91, 156, 245, 0.6);
  }
}

.dialog-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 28px;
  line-height: 1.6;
}

/* Benefits List */
.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 auto;
  max-width: 320px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(91, 156, 245, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(91, 156, 245, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: benefitSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.benefit-item:nth-child(1) { animation-delay: 0.1s; }
.benefit-item:nth-child(2) { animation-delay: 0.2s; }
.benefit-item:nth-child(3) { animation-delay: 0.3s; }

@keyframes benefitSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.benefit-item:hover {
  background: rgba(91, 156, 245, 0.1);
  border-color: rgba(91, 156, 245, 0.25);
  transform: translateX(4px);
}

.benefit-item span {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 500;
  flex: 1;
  text-align: left;
}

/* Action Buttons */
.dialog-actions {
  padding: 24px 32px 32px;
  display: flex;
  gap: 12px;
  justify-content: stretch;
  background: rgba(0, 0, 0, 0.2);
}

.cancel-btn {
justify-content: center;
align-items: center;
  flex: 0.8;
  text-transform: none;
  font-weight: 500;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 12px 24px;
  height: 48px !important;
  background: rgba(91, 156, 245, 0.05);
  border: 1px solid rgba(91, 156, 245, 0.15) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cancel-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(91, 156, 245, 0.1);
  border-color: rgba(91, 156, 245, 0.25) !important;
}

.subscribe-btn {
  flex: 1.2;
  text-transform: none;
  font-weight: 700;
  font-size: 1rem;
  background: linear-gradient(135deg, #030d31 0%, #040d21 100%);
  color: #ffffff;
  border-radius: 12px;
  padding: 12px 24px;
  height: 48px !important;
  border: 1px solid rgba(91, 156, 245, 0.6) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.subscribe-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s;
}

.subscribe-btn:hover::before {
  left: 100%;
}

.subscribe-btn:hover {
  background: linear-gradient(135deg, #030d31 0%, #040d21 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(15, 71, 177, 0.5),
              0 0 60px rgba(44, 73, 167, 0.2);
}

.subscribe-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(15, 71, 177, 0.3);
}

/* Responsive Design */
@media (max-width: 600px) {
  .subscription-dialog {
    border-radius: 24px;
    margin: 16px;
  }

  .crown-container {
    padding: 32px 0 16px;
  }

  .crown-icon {
    font-size: 56px !important;
  }

  .dialog-content {
    padding: 0 24px 20px;
  }

  .dialog-title {
    font-size: 1.5rem;
  }

  .dialog-subtitle {
    font-size: 1rem;
  }

  .dialog-description {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }

  .benefits-list {
    gap: 10px;
  }

  .benefit-item {
    padding: 10px 14px;
  }

  .benefit-item span {
    font-size: 0.9rem;
  }

  .dialog-actions {
    padding: 20px 24px 24px;
    flex-direction: column;
  }

  .cancel-btn,
  .subscribe-btn {
    flex: 1;
    width: 100%;
  }
}
</style>

