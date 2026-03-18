import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { Environments } from "../Environments/Environments";

export const app = initializeApp(Environments.firebaseConfig);

export const db = getFirestore(app)