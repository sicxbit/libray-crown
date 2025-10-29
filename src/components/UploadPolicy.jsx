import { storage,db } from "../firebase";
import { uploadBytes,getDownloadURL, ref } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";


export async function uploadPolicy(file, policyName, policyAttribute) {
  try {
    if (!file) throw new Error("No file selected.");

    // Create a unique storage reference
    const fileRef = ref(storage, `policies/${Date.now()}_${file.name}`);

    // Upload the file to Firebase Storage
    const snapshot = await uploadBytes(fileRef, file);

    // Get public URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Store metadata in Firestore
    await addDoc(collection(db, "test"), {
      name: policyName,
      attribute: policyAttribute,
      fileName: file.name,
      fileURL: downloadURL,
      uploadedAt: new Date(),
    });

    console.log("✅ Upload successful!");
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return { success: false, error: error.message };
  }
}
