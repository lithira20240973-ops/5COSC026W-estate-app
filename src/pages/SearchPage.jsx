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
    const next = [property, ...favourites];
    saveFavs(next);
  };

  const removeFavourite = (id) => {
    const next = favourites.filter((f) => f.id !== id);
    saveFavs(next);
  };

  const clearFavourites = () => {
    saveFavs([]);
  };

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
    e.preventDefault(); // required to allow drop
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
      // Type
      if (type !== "Any" && p.type !== type) return false;

      // Price
      const minP = minPrice === "" ? null : Number(minPrice);
      const maxP = maxPrice === "" ? null : Number(maxPrice);
      if (minP !== null && Number(p.price) < minP) return false;
      if (maxP !== null && Number(p.price) > maxP) return false;

      // Bedrooms
      const beds = minBeds === "" ? null : Number(minBeds);
      if (beds !== null && Number(p.bedrooms) < beds) return false;

      // Postcode Area
      const pc = postcodeArea.trim().toUpperCase();
      if (pc) {
        const loc = String(p.location || "").toUpperCase();
        const match = loc.match(/\b[A-Z]{1,2}\d[A-Z0-9]?\b/);
        const outward = match ? match[0] : "";
        if (!outward.startsWith(pc)) return false;
      }

      // Date Added (after / between)
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
  }, [
    properties,
    type,
    minPrice,
    maxPrice,
    minBeds,
    postcodeArea,
    dateFrom,
    dateTo,
  ]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1>Estate Agent</h1>
      <p>Total properties found: {filtered.length}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 12,
          background: "white",
          marginTop: 12,
          marginBottom: 16,
        }}
      >
        {/* Type */}
        <label>
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          >
            <option value="Any">Any</option>
            <option value="House">House</option>
            <option value="Flat">Flat</option>
          </select>
        </label>

        {/* Min Price */}
        <label>
          Min Price
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        {/* Max Price */}
        <label>
          Max Price
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        {/* Min Bedrooms */}
        <label>
          Min Bedrooms
          <input
            type="number"
            value={minBeds}
            onChange={(e) => setMinBeds(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        {/* Postcode Area */}
        <label>
          Postcode Area
          <input
            type="text"
            value={postcodeArea}
            onChange={(e) => setPostcodeArea(e.target.value)}
            placeholder="e.g. BR5"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        {/* Date From */}
        <label>
          Date From
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        {/* Date To */}
        <label>
          Date To
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <button
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
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#f6f6f6",
            cursor: "pointer",
            alignSelf: "end",
          }}
        >
          Clear filters
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* RESULTS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          {filtered.map((p) => (
            <div
                key={p.id}
                style={{ position: "relative" }}
                draggable
                onDragStart={(e) => onDragStartProperty(e, p)}
              >
              <Link
                to={`/property/${p.id}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 12,
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={"/" + (p.picture || "images/placeholder.jpg")}
                    alt={p.type}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder.jpg";
                    }}
                  />

                  <h3 style={{ margin: "12px 0 6px" }}>
                    {p.type} • {p.bedrooms} bed
                  </h3>

                  <div style={{ fontWeight: 700 }}>
                    £{Number(p.price).toLocaleString()}
                  </div>

                  <div style={{ marginTop: 6, color: "#444" }}>{p.location}</div>

                  <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>
                    Added: {p.added?.day} {p.added?.month} {p.added?.year}
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => addFavourite(p)}
                disabled={isFavourited(p.id)}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: isFavourited(p.id) ? "#eaeaea" : "white",
                  cursor: isFavourited(p.id) ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
                title={isFavourited(p.id) ? "Already in favourites" : "Add to favourites"}
              >
                {isFavourited(p.id) ? "★ Saved" : "☆ Favourite"}
              </button>
            </div>
          ))}
        </div>

        {/* FAVOURITES */}
        <div
          onDrop={onDropToFavourites}
          onDragOver={onDragOverFavourites}
          style={{
            marginTop: 16,
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 12,
            background: "white",
            position: "sticky",
            top: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <h3 style={{ margin: 0 }}>Favourites ({favourites.length})</h3>
            <button
              type="button"
              onClick={clearFavourites}
              disabled={favourites.length === 0}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: favourites.length === 0 ? "#f3f3f3" : "#fff",
                cursor: favourites.length === 0 ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              Clear
            </button>
          </div>

          <p style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
            Drag a property card and drop it here to add to favourites.
          </p>

          {favourites.length === 0 ? (
            <p style={{ color: "#666", marginTop: 10 }}>
              No favourites yet. Click ☆ Favourite on a property.
            </p>
          ) : (
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {favourites.map((f) => (
                <div
                  key={f.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 12,
                    padding: 10,
                    display: "grid",
                    gridTemplateColumns: "70px 1fr",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <img
                    src={"/" + (f.picture || "images/placeholder.jpg")}
                    alt={f.type}
                    style={{
                      width: 70,
                      height: 54,
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder.jpg";
                    }}
                  />

                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {f.type} • {f.bedrooms} bed
                    </div>
                    <div style={{ fontSize: 13, color: "#444" }}>
                      £{Number(f.price).toLocaleString()}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <Link to={`/property/${f.id}`} style={{ fontWeight: 600 }}>
                        View
                      </Link>

                      <button
                        type="button"
                        onClick={() => removeFavourite(f.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 10,
                          border: "1px solid #ddd",
                          background: "white",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
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