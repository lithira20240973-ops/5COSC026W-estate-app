import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import propertiesData from "../data/properties.json";

export default function SearchPage() {
  const properties = propertiesData.properties;

  // ---------------------------
  // INPUT STATE (user typing)
  // ---------------------------
  const [typeInput, setTypeInput] = useState("Any");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minBedsInput, setMinBedsInput] = useState("");
  const [postcodeAreaInput, setPostcodeAreaInput] = useState("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput] = useState("");

  // ---------------------------
  // APPLIED STATE (used for filtering)
  // (Apply Filters button updates these)
  // ---------------------------
  const [type, setType] = useState("Any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [postcodeArea, setPostcodeArea] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const applyFilters = () => {
    setType(typeInput);
    setMinPrice(minPriceInput);
    setMaxPrice(maxPriceInput);
    setMinBeds(minBedsInput);
    setPostcodeArea(postcodeAreaInput);
    setDateFrom(dateFromInput);
    setDateTo(dateToInput);
  };

  const resetFilters = () => {
    setTypeInput("Any");
    setMinPriceInput("");
    setMaxPriceInput("");
    setMinBedsInput("");
    setPostcodeAreaInput("");
    setDateFromInput("");
    setDateToInput("");

    setType("Any");
    setMinPrice("");
    setMaxPrice("");
    setMinBeds("");
    setPostcodeArea("");
    setDateFrom("");
    setDateTo("");
  };

  // ----- FAVOURITES (persisted) -----
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

  const isFavourited = (id) => favourites.some((f) => String(f.id) === String(id));

  const addFavourite = (property) => {
    if (isFavourited(property.id)) return; // no duplicates
    saveFavs([property, ...favourites]);
  };

  const removeFavourite = (id) => {
    saveFavs(favourites.filter((f) => String(f.id) !== String(id)));
  };

  const clearFavourites = () => saveFavs([]);

  // ----- DRAG & DROP (add + remove) -----
  const onDragStartProperty = (e, property) => {
    e.dataTransfer.setData("text/plain", `property:${property.id}`);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDragStartFavourite = (e, fav) => {
    e.dataTransfer.setData("text/plain", `fav:${fav.id}`);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDropToFavourites = (e) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    if (!payload.startsWith("property:")) return;

    const id = payload.replace("property:", "");
    const prop = properties.find((p) => String(p.id) === String(id));
    if (prop) addFavourite(prop);
  };

  const onDropToRemove = (e) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    if (!payload.startsWith("fav:")) return;

    const id = payload.replace("fav:", "");
    removeFavourite(id);
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

  // Convert property added date to ISO (YYYY-MM-DD)
  const propertyAddedAsISO = (p) => {
    const y = Number(p?.added?.year);
    const m = monthToNumber(p?.added?.month);
    const d = Number(p?.added?.day);
    if (!y || !m || !d) return "";
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (type !== "Any" && p.type !== type) return false;

      const minP = minPrice === "" ? null : Number(minPrice);
      const maxP = maxPrice === "" ? null : Number(maxPrice);
      if (minP !== null && Number(p.price) < minP) return false;
      if (maxP !== null && Number(p.price) > maxP) return false;

      const beds = minBeds === "" ? null : Number(minBeds);
      if (beds !== null && Number(p.bedrooms) < beds) return false;

      const pc = postcodeArea.trim().toUpperCase();
      if (pc) {
        const loc = String(p.location || "").toUpperCase();
        const match = loc.match(/\b[A-Z]{1,2}\d[A-Z0-9]?\b/);
        const outward = match ? match[0] : "";
        if (!outward.startsWith(pc)) return false;
      }

      const from = dateFrom || null;
      const to = dateTo || null;
      if (from || to) {
        const addedISO = propertyAddedAsISO(p);
        if (!addedISO) return false;
        if (from && addedISO < from) return false;
        if (to && addedISO > to) return false;
      }

      return true;
    });
  }, [properties, type, minPrice, maxPrice, minBeds, postcodeArea, dateFrom, dateTo]);

  return (
    <div className="page">
      {/* Top bar */}
      <div className="topbar">
        <div className="brand">SkyNest Rentals</div>
        <div className="topbarRight">
          <div className="pill">Results: {filtered.length}</div>
          <div className="pill">Favourites: {favourites.length}</div>
        </div>
      </div>

      {/* HERO / Heading (separate nicer section) */}
      <div className="heroCard">
        <div>
          <h1 className="heroTitle">Find your next home</h1>
          <p className="heroSub">
            Use filters then press <strong>Apply Filters</strong>. Drag properties into favourites, and drag favourites
            into the remove box to delete.
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
            <div className="label">Property type</div>
            <select className="select" value={typeInput} onChange={(e) => setTypeInput(e.target.value)}>
              <option value="Any">Any</option>
              <option value="House">House</option>
              <option value="Flat">Flat</option>
            </select>
          </div>

          <div className="field col3">
            <div className="label">Postcode area</div>
            <input
              className="input"
              type="text"
              value={postcodeAreaInput}
              onChange={(e) => setPostcodeAreaInput(e.target.value)}
              placeholder="e.g. BR5, NW1"
            />
          </div>

          <div className="field col3">
            <div className="label">Min price</div>
            <input
              className="input"
              type="number"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              placeholder="e.g. 250000"
            />
          </div>

          <div className="field col3">
            <div className="label">Max price</div>
            <input
              className="input"
              type="number"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              placeholder="e.g. 750000"
            />
          </div>

          <div className="field col3">
            <div className="label">Min beds</div>
            <input
              className="input"
              type="number"
              value={minBedsInput}
              onChange={(e) => setMinBedsInput(e.target.value)}
              placeholder="e.g. 2"
            />
          </div>

          <div className="field col3">
            <div className="label">Date from</div>
            <input className="input" type="date" value={dateFromInput} onChange={(e) => setDateFromInput(e.target.value)} />
          </div>

          <div className="field col3">
            <div className="label">Date to</div>
            <input className="input" type="date" value={dateToInput} onChange={(e) => setDateToInput(e.target.value)} />
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
                    src={"/" + (p.picture || "images/placeholder.jpg")}
                    alt={p.type}
                    onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                  />
                  <div className="cardBody">
                    <div className="cardTitle">{p.type} • {p.bedrooms} bed</div>
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

        {/* Favourites */}
        <div className="panel panelPad sticky">
          <div className="favHeader">
            <h3 style={{ margin: 0 }}>Favourites ({favourites.length})</h3>
            <button className="btn" type="button" onClick={clearFavourites} disabled={favourites.length === 0}>
              Clear
            </button>
          </div>

          {/* ADD drop zone */}
          <div className="dropZone" onDragOver={onDragOver} onDrop={onDropToFavourites}>
            <strong>Drop here to add ✅</strong>
            <div className="muted small">Drag a property card from the left into this box.</div>
          </div>

          {/* REMOVE drop zone */}
          <div className="removeZone" onDragOver={onDragOver} onDrop={onDropToRemove}>
            <strong>Drop here to remove 🗑️</strong>
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
                  title="Drag me to the remove box to delete"
                >
                  <img
                    className="favThumb"
                    src={"/" + (f.picture || "images/placeholder.jpg")}
                    alt={f.type}
                    onError={(e) => (e.currentTarget.src = "/images/placeholder.jpg")}
                  />

                  <div>
                    <div style={{ fontWeight: 900 }}>{f.type} • {f.bedrooms} bed</div>
                    <div className="muted">£{Number(f.price).toLocaleString()}</div>

                    <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
                      <Link className="link" to={`/property/${f.id}`}>View</Link>
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