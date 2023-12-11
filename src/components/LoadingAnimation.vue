
<template>
  <div class="loading-animation">
      <div class="dot dot1"></div>
      <div class="dot dot2"></div>
      <div class="dot dot3"></div>
  </div>
</template>


<style scoped>
.loading-animation {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dot {
  width: 5px;
  height: 5px;
  margin: 0 5px;
  border-radius: 50%;
  background-color: #333;
  display: inline-block;
  animation: jump 1.5s infinite ease-in-out;
}

.dot1 {
  animation-delay: 0.1s;
}

.dot2 {
  animation-delay: 0.3s;
}

.dot3 {
  animation-delay: 0.5s;
}

@keyframes jump {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-25px);
  }
}
</style>
