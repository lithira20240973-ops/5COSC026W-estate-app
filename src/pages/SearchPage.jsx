import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import propertiesData from "../data/properties.json";

export default function SearchPage() {
  const properties = propertiesData.properties;

  const [type, setType] = useState("Any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [postcodeArea, setPostcodeArea] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const isFavourited = (id) => favourites.some((f) => f.id === id);

  const addFavourite = (property) => {
    if (isFavourited(property.id)) return; // no duplicates
    saveFavs([property, ...favourites]);
  };

  const removeFavourite = (id) => {
    saveFavs(favourites.filter((f) => f.id !== id));
  };

  const clearFavourites = () => saveFavs([]);

  // ----- DRAG & DROP -----
  const onDragStartProperty = (e, property) => {
    e.dataTransfer.setData("text/plain", property.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDropToFavourites = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const prop = properties.find((p) => p.id === id);
    if (prop) addFavourite(prop);
  };

  const onDragOverFavourites = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
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
      {/* Top bar (unique look) */}
      <div className="topbar">
        <div className="brand">RentNest</div>

        <div className="topbarRight">
          <div className="pill">Results: {filtered.length}</div>
          <div className="pill">Favourites: {favourites.length}</div>
        </div>
      </div>

      {/* Filters panel */}
      <div className="panel panelPad">
        <div className="headerRow">
          <div>
            <h1 className="title">Find your next home</h1>
            <p className="subText">Filter by type, price, bedrooms, postcode and date added.</p>
          </div>

          <button
            className="btn btnPrimary"
            type="button"
            onClick={() => {
              setType("Any");
              setMinPrice("");
              setMaxPrice("");
              setMinBeds("");
              setPostcodeArea("");
              setDateFrom("");
              setDateTo("");
            }}
          >
            Reset filters
          </button>
        </div>

        <div className="filters">
          <div className="field col3">
            <div className="label">Property type</div>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
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
              value={postcodeArea}
              onChange={(e) => setPostcodeArea(e.target.value)}
              placeholder="e.g. BR5, NW1"
            />
          </div>

          <div className="field col3">
            <div className="label">Min price</div>
            <input className="input" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="e.g. 250000" />
          </div>

          <div className="field col3">
            <div className="label">Max price</div>
            <input className="input" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="e.g. 750000" />
          </div>

          <div className="field col3">
            <div className="label">Min beds</div>
            <input className="input" type="number" value={minBeds} onChange={(e) => setMinBeds(e.target.value)} placeholder="e.g. 2" />
          </div>

          <div className="field col3">
            <div className="label">Date from</div>
            <input className="input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>

          <div className="field col3">
            <div className="label">Date to</div>
            <input className="input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
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
        <div className="panel panelPad sticky" onDrop={onDropToFavourites} onDragOver={onDragOverFavourites}>
          <div className="favHeader">
            <h3 style={{ margin: 0 }}>Favourites ({favourites.length})</h3>
            <button className="btn" type="button" onClick={clearFavourites} disabled={favourites.length === 0}>
              Clear
            </button>
          </div>

          <div className="dropZone">
            Drag a property card and drop it here to add it.
          </div>

          {favourites.length === 0 ? (
            <p className="muted" style={{ marginTop: 10 }}>
              No favourites yet. Click ☆ Favourite or drag a card here.
            </p>
          ) : (
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {favourites.map((f) => (
                <div key={f.id} className="favItem">
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