const express = require("express");
const { db } = require("./firebaseConfig"); // Firebase config
const app = express();
const port = 3000;

app.use(express.json());

// Helper functions from your original code
const { GetBestChoice, generateTerms } = require("./searchAlgorithm");

app.get("/users", async (req, res) => {
  try {
    // Fetch user data from Firebase
    const userSnapshot = await db.collection("users").get();
    const userList = [];

    userSnapshot.forEach((doc) => userList.push(doc.data()));

    // Return the list of users fetched from the database
    res.status(200).json({ users: userList });
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    // Get the user ID from the request parameters
    const userId = req.params.id;

    // Fetch the user document from Firebase using the provided ID
    const userDoc = await db.collection("users").doc(userId).get();

    // Check if the user exists
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the user data
    const userData = userDoc.data();

    // Return the user data
    res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Error fetching user: ", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Endpoint to get properties from Firebase and return the best matches
app.get("/properties", async (req, res) => {
  try {
    // Fetch property data from Firebase
    const propertySnapshot = await db.collection("properties").get();
    const propertyList = [];

    propertySnapshot.forEach((doc) => propertyList.push(doc.data()));

    // Return the list of properties fetched from the database
    res.status(200).json({ properties: propertyList });
  } catch (error) {
    console.error("Error fetching properties: ", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// Endpoint to process search terms and filter properties
app.post("/search", async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm.toLowerCase(); // Get search term from request body

    // Generate filter based on search term
    const { terms, filter } = generateTerms(searchTerm);

    // Fetch property data from Firebase
    const propertySnapshot = await db.collection("properties").get();
    const propertyList = [];
    propertySnapshot.forEach((doc) => propertyList.push(doc.data()));

    // Get the best matching properties based on the generated filter
    const bestProperties = GetBestChoice(propertyList, filter);

    // Return sorted properties
    res.status(200).json({ properties: bestProperties });
  } catch (error) {
    console.error("Error processing search: ", error);
    res.status(500).json({ error: "Failed to process search" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
