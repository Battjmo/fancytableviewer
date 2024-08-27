import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "./hooks";
import {
  fetchOpportunities,
  editOpportunity,
  revertOpportunity,
  submitOpportunity,
} from "./opportunitiesSlice";
import { RootState } from "./store";

const OpportunitiesTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const opportunities = useAppSelector(
    (state: RootState) => state.opportunities.opportunities,
  );

  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: string;
  } | null>(null);
  const [tempValue, setTempValue] = useState<string | number>("");

  const handleCellClick = (
    id: string,
    field: string,
    currentValue: string | number,
  ) => {
    setEditingCell({ id, field });
    setTempValue(currentValue);
  };

  const handleCellChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempValue(event.target.value);
  };

  const handleCellBlur = () => {
    if (editingCell) {
      dispatch(
        editOpportunity({
          id: editingCell.id,
          field: editingCell.field,
          value: tempValue,
        }),
      );
      setEditingCell(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleCellBlur();
    }
  };

  const handleRevert = (id: string) => {
    dispatch(revertOpportunity({ id }));
  };

  const handleSubmit = async (id: string) => {
    // Call to update Salesforce, then update Redux
    await dispatch(submitOpportunity({ id }));
    // Dispatch a thunk that calls the Salesforce API to update the opportunity
    await dispatch(updateOpportunityInSalesforce(id));
  };

  return (
    <div>
      <h1>Opportunities</h1>
      <button onClick={() => dispatch(fetchOpportunities())}>
        Refresh Data
      </button>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Value</th>
            <th>Updated At</th>
            <th>Owner ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity) => (
            <tr key={opportunity.id}>
              {["name", "description", "value", "updatedAt", "ownerId"].map(
                (field) => (
                  <td key={field}>
                    {editingCell?.id === opportunity.id &&
                    editingCell.field === field ? (
                      <input
                        type="text"
                        value={tempValue}
                        onChange={handleCellChange}
                        onBlur={handleCellBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() =>
                          handleCellClick(
                            opportunity.id,
                            field,
                            opportunity[field as keyof Opportunity],
                          )
                        }
                      >
                        {opportunity[field as keyof Opportunity] || "N/A"}
                      </span>
                    )}
                  </td>
                ),
              )}
              <td>
                {opportunity.isEdited && (
                  <>
                    <button onClick={() => handleSubmit(opportunity.id)}>
                      Submit
                    </button>
                    <button onClick={() => handleRevert(opportunity.id)}>
                      Revert
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OpportunitiesTable;
