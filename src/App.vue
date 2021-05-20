


<template>
    <div id="app">
        <Main />
    </div>
</template>





<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';
import Main from './components/Main.vue';

@Component({
    components: {
        Main,
    },
})
export default class App extends Vue {}

</script>





<style lang="scss">

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    // text-align: center;
    //color: #2c3e50;
    // margin-top: 60px;
}

</style>


<style>

* { padding: 0; margin: 0; }

html, body, .app {
    height: 100%;
}

.fullscreen {
    position: absolute;
    width: 100vw;
    height: 100vh;

    display: flex;
    flex-direction: column;  
    justify-content: center; 
    align-items: center;     
    
}


</style>
