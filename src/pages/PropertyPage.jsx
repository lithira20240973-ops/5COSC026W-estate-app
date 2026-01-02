import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import propertiesData from "../data/properties.json";

export default function PropertyPage() {
  const { id } = useParams();
  const properties = propertiesData.properties;

  const property = useMemo(
    () => properties.find((p) => String(p.id) === String(id)),
    [properties, id]
  );

  const images = property?.images?.length
    ? property.images
    : [property?.picture || "images/placeholder.jpg"];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [tab, setTab] = useState("description");

  if (!property) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
        <p>Property not found.</p>
        <Link to="/">← Back to search</Link>
      </div>
    );
  }

  const TabButton = ({ value, children }) => (
    <button
      type="button"
      onClick={() => setTab(value)}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: tab === value ? "#111" : "white",
        color: tab === value ? "white" : "#111",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        ← Back to search
      </Link>

      <h1 style={{ marginTop: 12 }}>
        {property.type} • {property.bedrooms} bed
      </h1>

      <div style={{ fontWeight: 700, fontSize: 20 }}>
        £{Number(property.price).toLocaleString()}
      </div>

      <div style={{ marginTop: 6, color: "#444" }}>{property.location}</div>

      {/* GALLERY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
          marginTop: 16,
          maxWidth: 900,
        }}
      >
        {/* Main image */}
        <img
          src={"/" + activeImage}
          alt="Property"
          style={{
            width: "100%",
            height: 380,
            objectFit: "cover",
            borderRadius: 14,
            border: "1px solid #ddd",
            background: "#f6f6f6",
          }}
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.jpg";
          }}
        />

        {/* Thumbnails */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {images.map((img) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiveImage(img)}
              style={{
                padding: 0,
                borderRadius: 12,
                border: activeImage === img ? "2px solid #111" : "1px solid #ddd",
                cursor: "pointer",
                background: "white",
              }}
            >
              <img
                src={"/" + img}
                alt="Thumbnail"
                style={{
                  width: 100,
                  height: 70,
                  objectFit: "cover",
                  borderRadius: 12,
                  display: "block",
                }}
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.jpg";
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
        <TabButton value="description">Description</TabButton>
        <TabButton value="floorplan">Floorplan</TabButton>
        <TabButton value="map">Map</TabButton>
      </div>

      {/* TAB CONTENT */}
      <div
        style={{
          marginTop: 14,
          padding: 14,
          border: "1px solid #ddd",
          borderRadius: 12,
          background: "white",
          maxWidth: 900,
        }}
      >
        {tab === "description" && (
          <div>
            <h3 style={{ marginTop: 0 }}>Property details</h3>
            <ul style={{ marginTop: 8 }}>
              <li>Type: {property.type}</li>
              <li>Bedrooms: {property.bedrooms}</li>
              <li>Price: £{Number(property.price).toLocaleString()}</li>
              <li>Postcode: {String(property.location).split(" ").slice(-1)[0]}</li>
            </ul>

            <p style={{ color: "#444", lineHeight: 1.5 }}>
              {property.description ||
                "No description provided yet. Add a 'description' field in properties.json for each property to improve this section."}
            </p>
          </div>
        )}

        {tab === "floorplan" && (
          <div>
            <h3 style={{ marginTop: 0 }}>Floorplan</h3>
            <img
              src={"/" + (property.floorplan || "images/placeholder.jpg")}
              alt="Floorplan"
              style={{
                width: "100%",
                maxHeight: 420,
                objectFit: "contain",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "#f6f6f6",
              }}
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder.jpg";
              }}
            />
            <p style={{ color: "#666" }}>
              Tip: Add `"floorplan": "images/floorplan1.jpg"` to each property.
            </p>
          </div>
        )}

        {tab === "map" && (
          <div>
            <h3 style={{ marginTop: 0 }}>Map</h3>
            <div style={{ color: "#444", marginBottom: 10 }}>
              {property.location}
            </div>

            {/* Simple safe embed using a link (no API key needed) */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                property.location
              )}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: 600 }}
            >
              Open in Google Maps →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}