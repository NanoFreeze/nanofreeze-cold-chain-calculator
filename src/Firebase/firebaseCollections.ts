import { collection } from "firebase/firestore";
import { db } from "./initFirebase";

export const getFormsInstances = (tenant: string) => collection(db, tenant);