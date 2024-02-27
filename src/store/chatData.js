export default {
  // State
  namespaced: true,
  state: () => ({
    messages: [],
    is_chat_ends: true, //用来控制将全部答案写到chat.AI
    is_loading_chat: false, //用来控制显示聊天等待loading
  }),
  // Mutations
  mutations: {
    ADD_MESSAGE(state, message) {
      state.messages.push(message);
      // console.log(`ADD:${message}， current messages is: ${state.messages.join("")}`);
    },
    CLEAR_MESSAGES(state) {
      state.messages.length = 0;
    },
    SET_CHAT_END_STATUS(state, ending_status){
      state.is_chat_ends = ending_status;
    },
    SET_CHAT_LOADING_STATUS(state, loading_status){
      state.is_loading_chat = loading_status;
      // console.log(`set chat loading to ${loading_status}`);
    }
  },
  // Actions
  actions: {
    addMessage({ commit }, message) {
      commit('ADD_MESSAGE', message);
    },
    clearMessages({ commit }) {
      commit('CLEAR_MESSAGES');
    },
    setChatIsEndStatus({commit}, status){
      commit('SET_CHAT_END_STATUS', status)
    },
    setChatLoadingStatus({commit}, status){
      commit('SET_CHAT_LOADING_STATUS', status)
    },
  }
};

// export default createStore({
//     modules: {
//       chat: chatModule
//     }
// });
