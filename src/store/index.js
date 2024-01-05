// store/index.js
import { createStore } from 'vuex';
import ModelModule from './ModelModule';

const store =  createStore({
  modules: {
    model: ModelModule
  }
});

export default store;
