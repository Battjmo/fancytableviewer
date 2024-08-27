import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Opportunity {
    id: string;
    name: string;
    description?: string;
    value?: number;
    updatedAt: string;
    ownerId: string;
}

interface EditableOpportunity extends Opportunity {
    isEditing: boolean;
    changes?: Partial<Opportunity>;
}

interface OpportunitiesState {
    opportunities: EditableOpportunity[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: OpportunitiesState = {
    opportunities: [],
    status: 'idle',
};

const opportunitiesSlice = createSlice({
    name: 'opportunities',
    initialState,
    reducers: {
        startEditing: (state, action: PayloadAction<string>) => {
            const opportunity = state.opportunities.find(opp => opp.id === action.payload);
            if (opportunity) {
                opportunity.isEditing = true;
            }
        },
        editOpportunity: (state, action: PayloadAction<{ id: string; changes: Partial<Opportunity> }>) => {
            const opportunity = state.opportunities.find(opp => opp.id === action.payload.id);
            if (opportunity) {
                opportunity.changes = { ...opportunity.changes, ...action.payload.changes };
            }
        },
        cancelEditing: (state, action: PayloadAction<string>) => {
            const opportunity = state.opportunities.find(opp => opp.id === action.payload);
            if (opportunity) {
                opportunity.isEditing = false;
                delete opportunity.changes;
            }
        },
        saveChanges: (state, action: PayloadAction<string>) => {
            const opportunity = state.opportunities.find(opp => opp.id === action.payload);
            if (opportunity && opportunity.changes) {
                Object.assign(opportunity, opportunity.changes);
                opportunity.isEditing = false;
                delete opportunity.changes;
            }
        }
    }
});

export const { startEditing, editOpportunity, cancelEditing, saveChanges } = opportunitiesSlice.actions;
export default opportunitiesSlice.reducer;
