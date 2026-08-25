import { configureStore } from '@reduxjs/toolkit';
import loginReducer  from "../features/userSlice";
import dashboardReducer from "../features/dashboardSlice"
import deviceReducer from "../features/deviceSlice"
import createReducer from "../features/createSlice";
import missedCasesReducer from "../features/missedCasesSlice";
import responderReducer from "../features/responderSlice";
import analysisReducer from "../features/analysis";

const store = configureStore({
    reducer: {
      user: loginReducer,
      dashboard: dashboardReducer,
      device: deviceReducer,
      create: createReducer,
      missedCases: missedCasesReducer,
      responder: responderReducer,
      analysis: analysisReducer
    },
});
  
export default store;
