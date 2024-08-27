import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { RootState } from "./store";
import { fetchOpportunitiesFromSalesforce } from "./split";
import { writeBatch } from "firebase/firestore";

export interface Opportunity {
  id: string;
  name: string;
  description?: string;
  value?: number;
  updatedAt: string;
  ownerId: string;
  // Track if the opportunity has unsaved changes
  isEdited?: boolean;
  original?: Opportunity; // Store the original data for reverting changes
}

// Modify the initial state
interface OpportunitiesState {
  opportunities: Opportunity[];
  status: "idle" | "loading" | "succeeded" | "failed";
  editedOpportunities: { [id: string]: Opportunity }; // Track edited opportunities
}

const initialState: OpportunitiesState = {
  opportunities: [],
  status: "idle",
  editedOpportunities: {},
};

export const updateOpportunityInSalesforce = createAsyncThunk(
  "opportunities/updateOpportunityInSalesforce",
  async (id: string, { getState }) => {
    const state = getState() as RootState;
    const opportunity = state.opportunities.opportunities.find(
      (opp) => opp.id === id,
    );

    if (!opportunity) throw new Error("Opportunity not found");

    // Call Salesforce API to update the opportunity
    const accessToken = "yourAccessTokenHere"; // Replace with your actual access token
    const instanceUrl = "https://yourInstance.salesforce.com"; // Replace with your Salesforce instance URL
    const url = `${instanceUrl}/services/data/vXX.X/sobjects/Opportunity/${opportunity.id}`; // Replace vXX.X with your API version

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Name: opportunity.name,
        Description: opportunity.description,
        Amount: opportunity.value,
        LastModifiedDate: opportunity.updatedAt,
        OwnerId: opportunity.ownerId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update Salesforce: ${response.statusText}`);
    }

    return opportunity.id;
  },
);

// Async thunk to fetch opportunities from Firestore
export const fetchOpportunities = createAsyncThunk(
  "opportunities/fetchOpportunities",
  async () => {
    const db = getFirestore();
    const opportunitiesCollection = collection(db, "opportunities");
    const snapshot = await getDocs(opportunitiesCollection);
    const opportunities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Opportunity[];
    return opportunities;
  },
);

export const refreshOpportunities = createAsyncThunk(
  "opportunities/refreshOpportunities",
  async () => {
    const db = getFirestore();

    // Step 1: Fetch new data from Salesforce
    const newOpportunities = await fetchOpportunitiesFromSalesforce("1234");

    // Step 2: Update Firestore with new data
    const batchWriter = writeBatch(db);
    const opportunitiesCollection = collection(db, "opportunities");

    newOpportunities.forEach(async (opportunity: Opportunity) => {
      const opportunityDocRef = doc(opportunitiesCollection, opportunity.id);
      batchWriter.set(opportunityDocRef, opportunity);
    });
    await batchWriter.commit(); // Commit the batch write to Firestore

    // Step 3: Fetch the updated data from Firestore
    const snapshot = await getDocs(opportunitiesCollection);
    const updatedOpportunities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Opportunity[];

    return updatedOpportunities;
  },
);

// Reducer to handle editing
const opportunitiesSlice = createSlice({
  name: "opportunities",
  initialState,
  reducers: {
    editOpportunity: (state, action) => {
      const { id, field, value } = action.payload;
      const opportunity = state.opportunities.find((opp) => opp.id === id);

      if (opportunity) {
        if (!opportunity.original) {
          opportunity.original = { ...opportunity }; // Store the original values
        }
        opportunity[field] = value;
        opportunity.isEdited = true;
      }
    },
    revertOpportunity: (state, action) => {
      const { id } = action.payload;
      const opportunity = state.opportunities.find((opp) => opp.id === id);

      if (opportunity && opportunity.original) {
        // Revert to original values
        Object.assign(opportunity, opportunity.original);
        delete opportunity.original;
        opportunity.isEdited = false;
      }
    },
    submitOpportunity: (state, action) => {
      const { id } = action.payload;
      const opportunity = state.opportunities.find((opp) => opp.id === id);

      if (opportunity) {
        delete opportunity.original;
        opportunity.isEdited = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOpportunities.fulfilled, (state, action) => {
      state.opportunities = action.payload;
    });
  },
});

export const { editOpportunity, revertOpportunity, submitOpportunity } =
  opportunitiesSlice.actions;
export default opportunitiesSlice.reducer;
