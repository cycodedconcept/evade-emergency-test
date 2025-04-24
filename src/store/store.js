import { configureStore } from '@reduxjs/toolkit';
import loginReducer  from "../features/userSlice";
import deviceReducer from "../features/deviceSlice"
const store = configureStore({
    reducer: {
      user: loginReducer,
      device: deviceReducer
    },
});
  
export default store;