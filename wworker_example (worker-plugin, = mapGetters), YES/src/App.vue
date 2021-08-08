<template>
  <div>
    <div>
      ПРИВЕТ!
    </div>
    <div>
      = {{get_user}} =
    </div>
    <div @click="go">go ahead</div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  computed: {
    ...mapGetters([
        'get_user'
    ])
  },
  methods: {
    go() {
      console.log('01 ==============')
      this.$store.dispatch('work_user', '25')
      .then(ww => {
        console.log('then ==============', ww)   //у action невозможно прописать return с результатом работы воркера.
        this.myData = this.$store.getters.get_user;
      })
    }
  }
}
</script>

<style>
</style>
