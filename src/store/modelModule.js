export default {
  namespaced: true,
  state: () => ({
    currentModel: null
  }),
  mutations: {
    setCurrentModel(state, Model) {
      state.currentModel = Model;
    }
  },
  actions: {
    setModel({ commit }, Model) {
      commit('setCurrentModel', Model);
    },
    getModel({ state }) {
      return state.currentModel;
    }
  }
};