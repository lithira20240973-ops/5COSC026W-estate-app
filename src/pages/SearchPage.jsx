import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import propertiesData from "../data/properties.json";

const getBasePrefix = () => {
  if (typeof window === "undefined") return "/";

  const parts = window.location.pathname.split("/"); // ["", "repo", "property", "prop1"]
  const first = parts[1] || "";

  // On GitHub Pages the site lives under /<repo>/
  if (window.location.hostname.includes("github.io") && first) {
    return `/${first}/`;
  }

  // localhost / normal hosting
  return "/";
};

const BASE_PREFIX = getBasePrefix();

const withBase = (path) =>
  `${BASE_PREFIX}${String(path || "").replace(/^\/+/, "")}`;

export default function SearchPage() {
  const properties = propertiesData.properties;

  // PENDING (what user is typing/selecting)
  const [type, setType] = useState("Any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [postcodeArea, setPostcodeArea] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // APPLIED (what filtering actually uses)
  const [appliedFilters, setAppliedFilters] = useState({
    type: "Any",
    minPrice: "",
    maxPrice: "",
    minBeds: "",
    postcodeArea: "",
    dateFrom: "",
    dateTo: "",
  });

  const applyFilters = () => {
    setAppliedFilters({
      type,
      minPrice,
      maxPrice,
      minBeds,
      postcodeArea,
      dateFrom,
      dateTo,
    });
  };

  const resetFilters = () => {
    setType("Any");
    setMinPrice("");
    setMaxPrice("");
    setMinBeds("");
    setPostcodeArea("");
    setDateFrom("");
    setDateTo("");

    setAppliedFilters({
      type: "Any",
      minPrice: "",
      maxPrice: "",
      minBeds: "",
      postcodeArea: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  // ----- FAVOURITES  -----
  const FAV_KEY = "favourites";

  const loadFavs = () => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const [favourites, setFavourites] = useState(loadFavs);

  const saveFavs = (next) => {
    setFavourites(next);
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
  };

  const isFavourited = (id) => favourites.some((f) => f.id === id);

  const addFavourite = (property) => {
    if (!property) return;
    if (isFavourited(property.id)) return;
    saveFavs([property, ...favourites]);
  };

  const removeFavourite = (id) => {
    saveFavs(favourites.filter((f) => f.id !== id));
  };

  const clearFavourites = () => saveFavs([]);

  // ----- DRAG & DROP -----
  const onDragStartProperty = (e, property) => {
    e.dataTransfer.setData("text/plain", `add:${property.id}`);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDropToFavourites = (e) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    const [mode, id] = String(payload || "").split(":");

    // Only accept items from the left card list
    if (mode !== "add") return;

    const prop = properties.find((p) => p.id === id);
    if (prop) addFavourite(prop);
  };

  const onDragOverFavourites = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // DRAG FROM FAVOURITES → REMOVE ZONE
  const onDragStartFavourite = (e, fav) => {
    e.dataTransfer.setData("text/plain", `remove:${fav.id}`);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDropToRemoveZone = (e) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    const [mode, id] = String(payload || "").split(":");

    // Only accept items dragged from favourites
    if (mode !== "remove") return;

    removeFavourite(id);
  };

  const onDragOverRemoveZone = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Convert month name to number
  const monthToNumber = (m) => {
    const months = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    };
    return months[String(m || "").toLowerCase()] || 0;
  };

  const propertyAddedAsISO = (p) => {
    const y = Number(p?.added?.year);
    const m = monthToNumber(p?.added?.month);
    const d = Number(p?.added?.day);
    if (!y || !m || !d) return "";
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  // FILTERING USES APPLIED FILTERS
  const filtered = useMemo(() => {
    const {
      type: aType,
      minPrice: aMinPrice,
      maxPrice: aMaxPrice,
      minBeds: aMinBeds,
      postcodeArea: aPostcodeArea,
      dateFrom: aDateFrom,
      dateTo: aDateTo,
    } = appliedFilters;

    return properties.filter((p) => {
      if (aType !== "Any" && p.type !== aType) return false;

      const minP = aMinPrice === "" ? null : Number(aMinPrice);
      const maxP = aMaxPrice === "" ? null : Number(aMaxPrice);
      if (minP !== null && Number(p.price) < minP) return false;
      if (maxP !== null && Number(p.price) > maxP) return false;

      const beds = aMinBeds === "" ? null : Number(aMinBeds);
      if (beds !== null && Number(p.bedrooms) < beds) return false;

      const pc = aPostcodeArea.trim().toUpperCase();
      if (pc) {
        const loc = String(p.location || "").toUpperCase();
        const match = loc.match(/\b[A-Z]{1,2}\d[A-Z0-9]?\b/);
        const outward = match ? match[0] : "";
        if (!outward.startsWith(pc)) return false;
      }

      const from = aDateFrom || null;
      const to = aDateTo || null;
      if (from || to) {
        const addedISO = propertyAddedAsISO(p);
        if (!addedISO) return false;
        if (from && addedISO < from) return false;
        if (to && addedISO > to) return false;
      }

      return true;
    });
  }, [properties, appliedFilters]);

  return (
    <div className="page">
      {/* Top bar */}
      <div className="topbar">
        <div className="brand">RentNest</div>
        <div className="topbarRight">
          <div className="pill">Results: {filtered.length}</div>
          <div className="pill">Favourites: {favourites.length}</div>
        </div>
      </div>

      {/* HERO CARD */}
      <div className="heroCard">
        <div>
          <h1 className="heroTitle">Find your next home</h1>
          <p className="heroSub">
            Set your filters, then press <strong>Apply Filters</strong>. Drag cards to add.
            Drag favourites to the remove box to delete.
          </p>
        </div>

        <div className="heroActions">
          <button className="btn btnPrimary" type="button" onClick={applyFilters}>
            Apply Filters
          </button>
          <button className="btn" type="button" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      {/* Filters panel */}
      <div className="panel panelPad">
        <div className="filters">
          <div className="field col3">
            <label className="label" htmlFor="typeSelect">
              Property type
            </label>
            <select
              id="typeSelect"
              className="select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Any">Any</option>
              <option value="House">House</option>
              <option value="Flat">Flat</option>
            </select>
          </div>

          <div className="field col3">
            <label className="label" htmlFor="postcodeInput">
              Postcode area
            </label>
            <input
              id="postcodeInput"
              className="input"
              type="text"
              value={postcodeArea}
              onChange={(e) => setPostcodeArea(e.target.value)}
              placeholder="e.g. BR5, NW1"
            />
          </div>

          <div className="field col3">
            <label className="label" htmlFor="minPriceInput">
              Min price
            </label>
            <input
              id="minPriceInput"
              className="input"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="e.g. 250000"
            />
          </div>

          <div className="field col3">
            <label className="label" htmlFor="maxPriceInput">
              Max price
            </label>
            <input
              id="maxPriceInput"
              className="input"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="e.g. 750000"
            />
          </div>

          <div className="field col3">
            <label className="label" htmlFor="minBedsInput">
              Min beds
            </label>
            <input
              id="minBedsInput"
              className="input"
              type="number"
              value={minBeds}
              onChange={(e) => setMinBeds(e.target.value)}
              placeholder="e.g. 2"
            />
          </div>

          <div className="field col3">
            <label className="label" htmlFor="dateFromInput">
              Date from
            </label>
            <input
              id="dateFromInput"
              className="input"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="field col3">
            <label className="label" htmlFor="dateToInput">
              Date to
            </label>
            <input
              id="dateToInput"
              className="input"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mainGrid">
        {/* Cards */}
        <div className="cardsGrid">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="cardWrap"
              draggable
              onDragStart={(e) => onDragStartProperty(e, p)}
            >
              <Link to={`/property/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card cardHover">
                  <img
                    className="cardImg"
                    src={withBase(p.picture || "images/placeholder.jpg")}
                    alt={p.type}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = withBase("images/placeholder.jpg");
                    }}
                  />
                  <div className="cardBody">
                    <div className="cardTitle">
                      {p.type} • {p.bedrooms} bed
                    </div>
                    <div className="price">£{Number(p.price).toLocaleString()}</div>
                    <div className="muted">{p.location}</div>
                    <div className="muted small">
                      Added: {p.added?.day} {p.added?.month} {p.added?.year}
                    </div>
                  </div>
                </div>
              </Link>

              <button
                type="button"
                className={`favBtn ${isFavourited(p.id) ? "favBtnSaved" : ""}`}
                onClick={() => addFavourite(p)}
                disabled={isFavourited(p.id)}
                title={isFavourited(p.id) ? "Already in favourites" : "Add to favourites"}
              >
                {isFavourited(p.id) ? "★ Saved" : "☆ Favourite"}
              </button>
            </div>
          ))}
        </div>

        {/* Favourites panel */}
        <div className="panel panelPad sticky">
          <div className="favHeader">
            <h3 style={{ margin: 0 }}>Favourites ({favourites.length})</h3>
            <button className="btn" type="button" onClick={clearFavourites} disabled={favourites.length === 0}>
              Clear
            </button>
          </div>

          {/* DROP TO ADD */}
          <div className="dropZone" onDrop={onDropToFavourites} onDragOver={onDragOverFavourites}>
            <strong>Drop here to add </strong>
            <div className="muted small">Drag a property card from the left into this box.</div>
          </div>

          {/* DROP TO REMOVE */}
          <div className="removeZone" onDrop={onDropToRemoveZone} onDragOver={onDragOverRemoveZone}>
            <strong>Drop here to remove </strong>
            <div className="muted small">Drag a favourite item into this box to remove it.</div>
          </div>

          {favourites.length === 0 ? (
            <p className="muted" style={{ marginTop: 12 }}>
              No favourites yet. Click ☆ Favourite or drag a card to add.
            </p>
          ) : (
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {favourites.map((f) => (
                <div
                  key={f.id}
                  className="favItem"
                  draggable
                  onDragStart={(e) => onDragStartFavourite(e, f)}
                  title="Drag me to the remove box"
                >
                  <img
                    className="favThumb"
                    src={withBase(f.picture || "images/placeholder.jpg")}
                    alt={f.type}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = withBase("images/placeholder.jpg");
                    }}
                  />

                  <div>
                    <div style={{ fontWeight: 900 }}>
                      {f.type} • {f.bedrooms} bed
                    </div>
                    <div className="muted">£{Number(f.price).toLocaleString()}</div>

                    <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
                      <Link className="link" to={`/property/${f.id}`}>
                        View
                      </Link>
                      <button className="btn" type="button" onClick={() => removeFavourite(f.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}