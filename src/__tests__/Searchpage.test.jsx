import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SearchPage from "../pages/SearchPage";
import propertiesData from "../data/properties.json";

function renderPage() {
  return render(
    <MemoryRouter>
      <SearchPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

test("renders the search page heading", () => {
  renderPage();
  expect(screen.getByText(/find your next home/i)).toBeInTheDocument();
});

test("shows results count pill", () => {
  renderPage();
  const total = propertiesData.properties.length;
  expect(screen.getByText(new RegExp(`Results:\\s*${total}`, "i"))).toBeInTheDocument();
});

/* ✅ TEST 3: filter by type using Apply Filters button */
test("filters by property type (House) after clicking Apply Filters", async () => {
  const user = userEvent.setup();
  renderPage();

  // select House using LABEL (works because you added <label htmlFor>)
  const typeSelect = screen.getByLabelText(/property type/i);
  await user.selectOptions(typeSelect, "House");

  // click Apply Filters
  await user.click(screen.getByRole("button", { name: /apply filters/i }));

  const expected = propertiesData.properties.filter((p) => p.type === "House").length;
  expect(screen.getByText(new RegExp(`Results:\\s*${expected}`, "i"))).toBeInTheDocument();
});

/* ✅ TEST 4: filter by min beds using label */
test("filters by min beds after clicking Apply Filters", async () => {
  const user = userEvent.setup();
  renderPage();

  const minBedsInput = screen.getByLabelText(/min beds/i);
  await user.clear(minBedsInput);
  await user.type(minBedsInput, "3");

  await user.click(screen.getByRole("button", { name: /apply filters/i }));

  const expected = propertiesData.properties.filter((p) => Number(p.bedrooms) >= 3).length;
  expect(screen.getByText(new RegExp(`Results:\\s*${expected}`, "i"))).toBeInTheDocument();
});

/* ✅ TEST 5: add to favourites via button */
test("adds a property to favourites and updates favourites count", async () => {
  const user = userEvent.setup();
  renderPage();

  // click first Favourite button
  const favButtons = screen.getAllByRole("button", { name: /favourite/i });
  await user.click(favButtons[0]);

  expect(screen.getByText(/Favourites:\s*1/i)).toBeInTheDocument();

  const saved = JSON.parse(localStorage.getItem("favourites") || "[]");
  expect(saved.length).toBe(1);
});