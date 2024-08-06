<template>
  <div
    class="rounded-full shadow-xl flex justify-content items-center"
    :class="{
      [pawn.color.toLowerCase()]: true,
      'border-4 border-red-800 text-red-800 w-8 h-8': movable,
      'w-6 h-6': !movable
    }"
  >
    <div
      class="text-center w-full text-xl xl:text-2xl font-bold"
    >
      {{ pawn.name.split('.').at(1) }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pawn: {
      type: Object,
      required: true
    },
    movable: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.yellow {
  @apply bg-yellow-200;
}
.green {
  @apply bg-green-200;
}
.blue {
  @apply bg-blue-200;
}
.red {
  @apply bg-red-300;
}
</style>