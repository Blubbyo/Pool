import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'

// If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js'

// Add Firebase products that you want to use
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js'


import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
	apiKey: "AIzaSyCO8j4SG1nhyBvm7cLFrjg3WrI76V9mU60",
	authDomain: "poolwartung-6025c.firebaseapp.com",
	databaseURL: "https://poolwartung-6025c-default-rtdb.europe-west1.firebasedatabase.app/",
	projectId: "poolwartung-6025c",
	storageBucket: "poolwartung-6025c.firebasestorage.app",
	messagingSenderId: "432631760692",
	appId: "1:432631760692:web:8531a08af4816ded0f4761"
};




const app = initializeApp(firebaseConfig);
//const db = getDatabase(app);
export const db = getFirestore(app);
//window.firebaseDB = db; // für globale Nutzung