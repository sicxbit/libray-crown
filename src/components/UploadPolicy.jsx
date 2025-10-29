import { storage, db, auth } from "../firebase";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";

export async function uploadPolicy(file, policyName, policyAttribute) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in to upload.");

    if (!file) throw new Error("No file selected.");

    // Create a unique storage reference
    const fileRef = ref(storage, `policies/${Date.now()}_${file.name}`);

    // Upload the file
    const snapshot = await uploadBytes(fileRef, file);

    // Get file URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Store metadata in Firestore
    await addDoc(collection(db, "policies"), {
      name: policyName,
      attribute: policyAttribute,
      fileName: file.name,
      fileURL: downloadURL,
      uploadedAt: new Date(),
      uploadedBy: user.email, // ✅ record who uploaded
      uid: user.uid,
    });
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return { success: false, error: error.message };
  }
}
