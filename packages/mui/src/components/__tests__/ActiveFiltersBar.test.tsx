import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFieldStore, GenericField } from "@vaened/react-search-builder";
import { describe, expect, it } from "vitest";
import { ActiveFiltersBar } from "../ActiveFiltersBar";
import { SearchForm } from "../SearchForm";

const renderWithStore = (initialData: Record<string, any> = {}) => {
  const store = createFieldStore({ persistInUrl: false });

  Object.entries(initialData).forEach(([key, value]) => {
    store.register({ name: key, type: "string", value: "" } as GenericField);
    store.set(key, value);
  });

  store.persist();

  return {
    ...render(
      <SearchForm store={store}>
        <ActiveFiltersBar />
      </SearchForm>
    ),
    store,
  };
};

describe("ActiveFiltersBar", () => {
  it("should render nothing if no filters are active", () => {
    renderWithStore({});
    expect(screen.queryByTestId("clear-all-filters-trigger-button")).toBeDisabled();
  });

  it("should render chips for active filters", () => {
    renderWithStore({ status: "active", type: "user" });

    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("user")).toBeInTheDocument();
  });

  it("should remove a specific filter when clicking its chip delete icon", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore({ status: "active", role: "admin" });

    const deleteBtn = screen.getByTestId("CancelIcon");

    await user.click(deleteBtn);

    expect(store.get("status")?.value).toBe("");
    expect(store.get("role")?.value).toBe("admin");
  });

  it("should clear all filters when clicking 'Clear All'", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore({ a: "1", b: "2" });

    const clearButton = screen.getByTestId("clear-all-filters-trigger-button");

    await user.click(clearButton);

    expect(store.get("a")?.value).toBe("");
    expect(store.get("b")?.value).toBe("");
  });
});
