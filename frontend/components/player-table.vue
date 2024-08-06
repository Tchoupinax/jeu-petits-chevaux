<template>
  <table class="w-2/3 mt-24 bg-gray-300 table-auto">
    <thead>
      <tr>
        <th class="px-4 py-2">
          Name
        </th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="(participant, index) of participants"
        :key="participant.id"
        :class="{ 'bg-gray-100': index % 2 === 0 }"
        class="text-center"
      >
        <td class="flex items-center w-full px-4 py-2 border">
          <div class="flex items-center justify-between w-full">
            <div class="w-8 h-8 overflow-hidden bg-red-300 rounded-full">
              <img :src="participant.imageUrl">
            </div>

            <div class="flex justify-between w-full">
              <p class="ml-4">
                {{ participant.name }}
              </p>
              
              <p
                class="font-bold"
                :class="{
                  'text-green-600': participant.color ==='Green',
                  'text-red-600': participant.color === 'Red',
                  'text-blue-600': participant.color === 'Blue',
                  'text-yellow-600': participant.color === 'Yellow',
                }"
              >
                {{ participant.color }}
              </p>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    participants: {
      required: true,
      type: Array
    }
  }
};
</script>
