import { clearLoginData } from '@/utils/utils';


export default {
  namespaced: true,
  state: () => ({
    user: null,
    currentModel: null,
    isLoginDialogVisible: false,
    isLogined: false,
  }),
  mutations: {
    setCurrentUserModelId(state, value) { 
      state.user.current_model_id = value;
    },
    setCurrentUserModeEnginelId(state, value) { 
      state.user.current_model_engine_id = value;
    },
    setUser(state, value) { 
      state.user = value;
    },
    setCurrentModel(state, Model) {
      state.currentModel = Model;
    },
    setIsLoginDialogVisible(state, isVisible) { 
      state.isLoginDialogVisible = isVisible;
    },
    setIsLogined(state, value) { 
      state.isLogined = value;
    }
  },
  actions: {
    setCurrentUserModelId({ commit }, value) {
      commit('setCurrentUserModelId', value);
    },
    setCurrentUserModelEngineId({ commit }, value) {
      commit('setCurrentUserModeEnginelId', value);
    },
    getCurrentUserModelId({ state }) {
      return state.user.current_model_id;
    },
    setUser({commit}, value){
      commit('setUser', value);
    },
    getUser({ state }) {
      return state.user;
    },

    setModel({ commit }, Model) {
      commit('setCurrentModel', Model);
    },
    getModel({ state }) {
      return state.currentModel;
    },
    showLoginDialog({ commit }) { 
      commit('setIsLoginDialogVisible', true);
    },
    hideLoginDialog({ commit }) {
      commit('setIsLoginDialogVisible', false);
    },
    login({commit}) {
      commit('setIsLogined', true);
      // console.log("set isLogined to true")
    },
    logout({commit}){
      commit('setIsLogined', false);
      clearLoginData();
      window.location.href = '/';
      // console.log("Logout and clear login data")
    }
  }
};

// export default createStore({
//   modules: {
//     publicData: publicDataModule
//   }
// });