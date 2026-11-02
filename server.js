import express from "express";

const app = express();

app.use(express.json());
app.set("json spaces", 2);

let listings = [
  { id: 1, title: "Nile View Apartment", pricePerNight: 85 },
  { id: 2, title: "Beach House", pricePerNight: 140 },
  { id: 3, title: "Desert Eco-Lodge", pricePerNight: 60 },
];
let nextId = 4;

// model
function getAllListings() {
  return listings;
}

function getListingById(id) {
  return listings.find((listing) => listing.id === id);
}

function addListing(data) {
  const listing = {
    id: nextId++,
    title: data.title,
    pricePerNight: data.pricePerNight,
  };
  listings.push(listing);
  return listing;
}

function updateListing(id, data) {
  const listing = getListingById(id);
  if (listing) {
    listing.title = data.title;
    listing.pricePerNight = data.pricePerNight;
  }
  return listing;
}

function removeListing(id) {
  const listing = getListingById(id);
  listings = listings.filter((item) => item.id !== id);
  return listing;
}

// controller
function handleGetAll(req, res) {
  res.json(getAllListings());
}

function handleGetOne(req, res) {
  const listing = getListingById(Number(req.params.id));
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.json(listing);
}

function handleCreate(req, res) {
  const data = req.body;
  if (!data.title || data.pricePerNight == null) {
    return res
      .status(400)
      .json({ error: "title and pricePerNight are required" });
  }
  const newListing = addListing(data);
  res.status(201).json(newListing);
}

function handleUpdate(req, res) {
  const data = req.body;
  if (!data.title || data.pricePerNight == null) {
    return res
      .status(400)
      .json({ error: "title and pricePerNight are required" });
  }
  const listing = updateListing(Number(req.params.id), data);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.json(listing);
}

function handleDelete(req, res) {
  const listing = removeListing(Number(req.params.id));
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.status(204).end();
}

// routes
app.get("/listings", handleGetAll);
app.get("/listings/:id", handleGetOne);
app.post("/listings", handleCreate);
app.put("/listings/:id", handleUpdate);
app.delete("/listings/:id", handleDelete);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});