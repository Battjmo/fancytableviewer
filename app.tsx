import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import OpportunitiesTable from "./OpportunitiesTable";
import initializeFirebase from "./firebase";

const db = initializeFirebase();

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <OpportunitiesTable />
      </div>
    </Provider>
  );
};

export default App;
