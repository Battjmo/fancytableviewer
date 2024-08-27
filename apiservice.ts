import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Opportunity } from './types'; // Define the Opportunity type

const instanceUrl = 'https://yourInstance.salesforce.com'; // Your Salesforce instance URL

export const apiService = createApi({
    reducerPath: 'apiService',
    baseQuery: fetchBaseQuery({
        baseUrl: instanceUrl,
        prepareHeaders: (headers) => {
            const accessToken = 'yourSalesforceAccessToken'; // Set your Salesforce access token
            headers.set('Authorization', `Bearer ${accessToken}`);
            return headers;
        }
    }),
    endpoints: (builder) => ({
        fetchOpportunities: builder.query<Opportunity[], void>({
            query: () => ({
                url: '/services/data/vXX.X/query',
                params: { q: 'SELECT Id, Name, Description, Amount, LastModifiedDate, OwnerId FROM Opportunity' }
            }),
            transformResponse: (response: { records: any[] }) => response.records.map(record => ({
                id: record.Id,
                name: record.Name,
                description: record.Description,
                value: record.Amount,
                updatedAt: record.LastModifiedDate,
                ownerId: record.OwnerId
            })),
        }),
        updateOpportunityInSalesforce: builder.mutation<void, Opportunity>({
            query: (opportunity) => ({
                url: `/services/data/vXX.X/sobjects/Opportunity/${opportunity.id}`,
                method: 'PATCH',
                body: opportunity,
            }),
        }),
        updateOpportunityInFirestore: builder.mutation<void, Opportunity>({
            async queryFn(opportunity) {
                const db = getFirestore(); // Ensure Firestore is initialized

                try {
                    const opportunityDocRef = doc(db, 'opportunities', opportunity.id);
                    await setDoc(opportunityDocRef, opportunity); // Update Firestore with the new data
                    return { data: undefined };
                } catch (error) {
                    return { error: { status: 'CUSTOM_ERROR', error: error.message } };
                }
            }
        }),
    }),
});

export const { useFetchOpportunitiesQuery, useUpdateFirestoreOpportunitiesMutation } = apiService;
