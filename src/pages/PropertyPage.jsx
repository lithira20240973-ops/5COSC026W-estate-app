import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import propertiesData from "../data/properties.json";

export default function PropertyPage() {
  const { id } = useParams();
  const properties = propertiesData.properties;

  // GitHub Pages base path helper 
  const withBase = (path) =>
    `${import.meta.env.BASE_URL}${String(path || "").replace(/^\/+/, "")}`;

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
      <div className="page">
        <div className="panel panelPad">
          <p style={{ marginTop: 0 }}>Property not found.</p>
          <Link className="link" to="/">← Back to search</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Top bar */}
      <div className="topbar">
        <div className="brand">SkyNest Rentals</div>
        <div className="topbarRight">
          <Link className="topLink" to="/">← Back to search</Link>
        </div>
      </div>

      {/* Header */}
      <div className="detailsHeader">
        <h1 className="title" style={{ marginBottom: 6 }}>
          {property.type} • {property.bedrooms} bed
        </h1>

        <div className="detailsMeta">
          <span className="badge">£{Number(property.price).toLocaleString()}</span>
          <span className="muted">{property.location}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="detailsGrid">
        {/* LEFT: Gallery */}
        <div className="panel">
          <div className="detailsMainImgWrap">
            <img
              className="detailsMainImg"
              src={withBase(activeImage)}
              alt="Property"
              onError={(e) => {
                e.currentTarget.src = withBase("images/placeholder.jpg");
              }}
            />
          </div>

          <div className="thumbRow">
            {images.map((img) => (
              <button
                key={img}
                type="button"
                className={`thumbBtn ${activeImage === img ? "thumbActive" : ""}`}
                onClick={() => setActiveImage(img)}
              >
                <img
                  className="thumbImg"
                  src={withBase(img)}
                  alt="Thumbnail"
                  onError={(e) => {
                    e.currentTarget.src = withBase("images/placeholder.jpg");
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Tabs */}
        <div className="panel panelPad">
          <div className="tabs">
            <button
              type="button"
              className={`tabBtn ${tab === "description" ? "tabActive" : ""}`}
              onClick={() => setTab("description")}
            >
              Description
            </button>
            <button
              type="button"
              className={`tabBtn ${tab === "floorplan" ? "tabActive" : ""}`}
              onClick={() => setTab("floorplan")}
            >
              Floorplan
            </button>
            <button
              type="button"
              className={`tabBtn ${tab === "map" ? "tabActive" : ""}`}
              onClick={() => setTab("map")}
            >
              Map
            </button>
          </div>

          <div className="tabContent">
            {tab === "description" && (
              <>
                <h3 style={{ marginTop: 0 }}>Property details</h3>

                <div className="kvGrid">
                  <div className="kv">
                    <div className="kvLabel">Type</div>
                    <div className="kvValue">{property.type}</div>
                  </div>
                  <div className="kv">
                    <div className="kvLabel">Bedrooms</div>
                    <div className="kvValue">{property.bedrooms}</div>
                  </div>
                  <div className="kv">
                    <div className="kvLabel">Price</div>
                    <div className="kvValue">£{Number(property.price).toLocaleString()}</div>
                  </div>
                  <div className="kv">
                    <div className="kvLabel">Postcode</div>
                    <div className="kvValue">
                      {String(property.location).split(" ").slice(-1)[0]}
                    </div>
                  </div>
                </div>

                <p className="detailsParagraph">
                  {property.description ||
                    "No description provided yet. Add a 'description' field in properties.json for each property to improve this section."}
                </p>
              </>
            )}

            {tab === "floorplan" && (
              <>
                <h3 style={{ marginTop: 0 }}>Floorplan</h3>
                <img
                  className="floorplanImg"
                  src={withBase(property.floorplan || "images/placeholder.jpg")}
                  alt="Floorplan"
                  onError={(e) => {
                    e.currentTarget.src = withBase("images/placeholder.jpg");
                  }}
                />
              </>
            )}

            {tab === "map" && (
              <>
                <h3 style={{ marginTop: 0 }}>Map</h3>
                <p className="muted" style={{ marginTop: 6 }}>
                  {property.location}
                </p>

                <a
                  className="btn btnPrimary"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    property.location
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-block", textDecoration: "none" }}
                >
                  Open in Google Maps →
                </a>

                <p className="muted small" style={{ marginTop: 12 }}>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}