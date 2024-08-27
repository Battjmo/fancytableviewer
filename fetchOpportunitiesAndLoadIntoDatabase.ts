import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Your Firebase configuration (replace with your own)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch opportunities from Salesforce and load into Firestore
const fetchOpportunitiesAndLoadIntoFirestore = async (accessToken) => {
  const query =
    "SELECT Name, Description, Amount, LastModifiedDate, Id, OwnerId FROM Opportunity";
  const instanceUrl = "https://yourInstance.salesforce.com"; // Replace with your Salesforce instance URL
  const url = `${instanceUrl}/services/data/vXX.X/query/?q=${encodeURIComponent(query)}`; // Replace vXX.X with your API version

  try {
    // Fetch opportunities from Salesforce
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    const opportunities = data.records;

    // Load opportunities into Firestore
    const opportunitiesCollection = collection(db, "opportunities");

    for (const opportunity of opportunities) {
      await addDoc(opportunitiesCollection, {
        name: opportunity.Name,
        description: opportunity.Description,
        value: opportunity.Amount,
        updatedAt: opportunity.LastModifiedDate,
        id: opportunity.Id,
        ownerId: opportunity.OwnerId,
      });
      console.log(
        `Opportunity ${opportunity.Name} has been added to Firestore`,
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Example usage
const accessToken = "yourAccessTokenHere"; // Replace with your actual access token
fetchOpportunitiesAndLoadIntoFirestore(accessToken);
