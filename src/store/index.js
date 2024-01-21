// store/index.js
import { createStore } from 'vuex';
import publicData from './publicData';
import createPersistedState from "vuex-persistedstate";


const store =  createStore({
  modules: {
    public_data: publicData
  },
  plugins: [createPersistedState({
    paths: ['public_data'] 
  })],
});

export default store;
