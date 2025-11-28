/**
 * @author enea dhack <contact@vaened.dev>
 * @link https://vaened.dev DevFolio
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createFieldStore, useSearchStore } from "@vaened/react-search-builder";
import { describe, expect, it } from "vitest";
import { OptionSelect } from "../OptionSelect";
import { SearchForm } from "../SearchForm";

const createTestStore = () => createFieldStore({ persistInUrl: false });

describe("OptionSelect Component", () => {
  describe("1. Integration Modes", () => {
    it("should work when wrapped in <SearchForm> (Context Mode)", async () => {
      render(
        <SearchForm>
          <OptionSelect name="status" type="string" label="Status" items={{ active: "Active", inactive: "Inactive" }} />
        </SearchForm>
      );

      expect(screen.getByLabelText("Status")).toBeInTheDocument();
    });

    it("should work standalone when store is passed manually (Manual Mode)", async () => {
      const TestComponent = () => {
        const store = useSearchStore({ persistInUrl: false });
        return <OptionSelect store={store} name="role" type="string" label="Role" items={{ admin: "Admin" }} />;
      };

      render(<TestComponent />);
      expect(screen.getByLabelText("Role")).toBeInTheDocument();
    });

    it("should throw a descriptive error if store is missing", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<OptionSelect name="fail" type="string" items={{ a: "A" }} />);
      }).toThrow(/MISSING STORE CONFIGURATION/);

      consoleSpy.mockRestore();
    });
  });

  describe("2. Data Rendering Patterns", () => {
    it("should render options from a Key-Value Object", async () => {
      const user = userEvent.setup();
      const store = createTestStore();

      render(<OptionSelect store={store} name="fruit" type="string" label="Fruit" items={{ apple: "Apple", banana: "Banana" }} />);

      await user.click(screen.getByRole("combobox", { name: /Fruit/i }));

      const listbox = screen.getByRole("listbox");
      expect(within(listbox).getByText("Apple")).toBeInTheDocument();
      expect(within(listbox).getByText("Banana")).toBeInTheDocument();
    });

    it("should render options from an Array with accessors", async () => {
      const user = userEvent.setup();
      const store = createTestStore();
      const users = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];

      render(
        <OptionSelect
          store={store}
          name="userId"
          type="number"
          label="User"
          items={users}
          getValue={(u) => u.id}
          getLabel={(u) => u.name}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const listbox = screen.getByRole("listbox");
      expect(within(listbox).getByText("Alice")).toBeInTheDocument();
      expect(within(listbox).getByText("Bob")).toBeInTheDocument();
    });

    it("should render children directly (MenuItem)", async () => {
      const { MenuItem } = await import("@mui/material");
      const user = userEvent.setup();
      const store = createTestStore();

      render(
        <OptionSelect store={store} name="city" type="string" label="City">
          <MenuItem value="ny">New York</MenuItem>
          <MenuItem value="la">Los Angeles</MenuItem>
        </OptionSelect>
      );

      await user.click(screen.getByRole("combobox"));
      expect(screen.getByRole("option", { name: "New York" })).toBeInTheDocument();
    });

    it("should throw conflict error if BOTH items and children are provided", () => {
      const store = createTestStore();
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        // @ts-expect-error Testing invalid configuration at runtime
        render(<OptionSelect store={store} name="fail" type="string" items={{ a: "A" }} children={<div />} />);
      }).toThrow(/OPTION SELECT PROPS CONFLICT/);

      consoleSpy.mockRestore();
    });
  });

  describe("3. Interaction & State", () => {
    it("should update the store when an option is selected", async () => {
      const user = userEvent.setup();
      const store = createTestStore();

      render(<OptionSelect store={store} name="status" type="string" label="Status" items={{ open: "Open", closed: "Closed" }} />);

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Closed" }));

      expect(store.get("status")?.value).toBe("closed");
    });

    it("should handle multiple selection (Array type)", async () => {
      const user = userEvent.setup();
      const store = createTestStore();

      render(<OptionSelect store={store} name="tags" type="string[]" label="Tags" items={{ bug: "Bug", feature: "Feature" }} />);

      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "Bug" }));
      await user.click(screen.getByRole("option", { name: "Feature" }));

      expect(store.get("tags")?.value).toEqual(["bug", "feature"]);
    });
  });
});
