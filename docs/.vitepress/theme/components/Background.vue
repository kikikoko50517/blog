<template>
  <div
    class="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden  [--geist-foreground:#fff] [--gradient-stop-1:0px] [--gradient-stop-2:120px] sm:[--gradient-stop-1:0px] sm:[--gradient-stop-2:120px] dark:[--geist-foreground:#1B1B1F]">

    <div :style="{
      background: 'linear-gradient(180deg, var(--gradient-color-1) 0%, var(--gradient-color-2) var(--gradient-stop-1), var(--gradient-color-3) var(--gradient-stop-2), 100% transparent)'
    }"
      class="absolute z-[-1] h-full w-full [--gradient-stop-1:60%] [--gradient-stop-2:85%] lg:[--gradient-stop-1:50%] lg:[--gradient-stop-2:90%] [--gradient-color-1=rgba(0,0,0,1)] [--gradient-color-2=rgba(0,0,0,0.8)] [--gradient-color-3=rgba(0,0,0,0)] dark:[--gradient-color-1=rgba(255,255,255,1)] dark:[--gradient-color-2=rgba(255,255,255,0.8)] dark:[--gradient-color-3=rgba(255,255,255,0)]" />

    <span class="leftLights" />
    <span class="rightLights" />
    <span className="absolute bottom-0 left-0 h-48 w-full bg-gradient-to-t from-white to-transparent dark:from-black" />
    <span
      className="absolute left-0 top-[20vh] h-[50vh] w-full bg-gradient-to-b from-white to-transparent dark:from-black" />
    <TurboheroBackground />
  </div>
</template>

<script setup lang="ts">
import TurboheroBackground from './TurboheroBackground.vue'
</script>

<style></style>
