import { configureStore } from '@reduxjs/toolkit';
import loginReducer  from "../features/userSlice"
const store = configureStore({
    reducer: {
      user: loginReducer
    },
});
  
export default store;