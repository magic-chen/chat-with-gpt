export default {
  namespaced: true,
  state: () => ({
    currentUserModelId: null,
    userName: null,
    currentModel: null,
    isLoginDialogVisible: false,
    isLogined: false,
  }),
  mutations: {
    setCurrentUserModelId(state, value) { 
      state.currentUserModelId = value;
      console.log('set current model id to ', value)
    },
    setUserName(state, value) { 
      state.userName = value;
      console.log('set user name to ', value)
    },
    setcurrentModel(state, Model) {
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
    getCurrentUserModelId({ state }) {
      return state.currentUserModelId;
    },
    setUserName({commit}, value){
      commit('setUserName', value);
    },
    getUserName({ state }) {
      return state.userName;
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
      console.log("set isLogined to true")
    },
    logout({commit}){
      commit('setIsLogined', false);
      console.log("set isLogined to false")
    }
  }
};