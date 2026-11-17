import express from "express";
import mongoose from "mongoose";

const app = express();

// ========== MIDDLEWARE ==========

// Log every request, then pass it on
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// Read JSON request bodies into req.body
app.use(express.json());

// ========== DATABASE ==========

async function connectDB() {
  // Atlas is far away: this can take a few seconds
  console.log("Connecting to MongoDB...");

  // The connection string, from .env
  const uri = process.env.MONGODB_URI;

  // dbName picks the database inside your cluster
  await mongoose.connect(uri, { dbName: "ebd-bnb" });
  console.log("Connected to MongoDB");
}

// ========== MODEL ==========

// The shape of one listing
const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
});

// The model: our handle on the "listings" collection
const Listing = mongoose.model("Listing", listingSchema);

async function getAllListings() {
  return Listing.find();
}

async function getListingById(id) {
  // "abc" can never be an _id: not found
  if (!mongoose.isValidObjectId(id)) return null;
  return Listing.findById(id);
}

async function addListing(data) {
  // The schema keeps only the fields it knows
  return Listing.create(data);
}

async function updateListing(id, data) {
  if (!mongoose.isValidObjectId(id)) return null;
  // new: true sends back the listing after the update
  return Listing.findByIdAndUpdate(id, data, { new: true });
}

async function removeListing(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Listing.findByIdAndDelete(id);
}

// ========== CONTROLLERS ==========

async function handleGetAll(req, res) {
  res.json(await getAllListings());
}

async function handleGetOne(req, res) {
  const listing = await getListingById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.json(listing);
}

async function handleCreate(req, res) {
  const data = req.body || {}; // no body sent? use an empty object
  if (!data.title || !data.pricePerNight) {
    return res
      .status(400)
      .json({ error: "title and pricePerNight are required" });
  }
  res.status(201).json(await addListing(data));
}

async function handleUpdate(req, res) {
  const data = req.body || {};
  if (!data.title || !data.pricePerNight) {
    return res
      .status(400)
      .json({ error: "title and pricePerNight are required" });
  }
  const listing = await updateListing(req.params.id, data);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.json(listing);
}

async function handleDelete(req, res) {
  const listing = await removeListing(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.status(204).end(); // done, nothing to send back
}

// ========== ROUTES ==========

app.get("/", (req, res) => {
  res.send("Welcome to ebd bn'b");
});

app.get("/api/listings", handleGetAll);
app.get("/api/listings/:id", handleGetOne);
app.post("/api/listings", handleCreate);
app.put("/api/listings/:id", handleUpdate);
app.delete("/api/listings/:id", handleDelete);

// ========== START ==========

await connectDB(); // no database, no server

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});