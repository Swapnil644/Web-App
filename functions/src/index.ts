
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import { GoogleGenAI } from "@google/genai";

admin.initializeApp();
const db = admin.firestore();

// Stub for Gemini API. Uncomment and add API_KEY to environment variables.
// const GEMINI_API_KEY = functions.config().gemini?.api_key;
// let genAI: GoogleGenAI;
// if (GEMINI_API_KEY) {
//   genAI = new GoogleGenAI(GEMINI_API_KEY);
// } else {
//   functions.logger.warn("Gemini API Key not found.");
// }


/**
 * Callable function to grant a user admin privileges.
 */
export const addAdminRole = functions.https.onCall(async (data, context) => {
  // Check if request is made by an admin
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Must be an admin to grant admin rights."
    );
  }

  const email = data.email;
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `Success! ${email} has been made an admin.` };
  } catch (error) {
    functions.logger.error("Error setting custom claims", error);
    throw new functions.https.HttpsError("internal", "Error making user admin.");
  }
});


/**
 * Firestore trigger for when a new item is created.
 * Stubs for Gemini API tagging and basic item matching.
 */
export const onItemCreate = functions.firestore
  .document("items/{itemId}")
  .onCreate(async (snap, context) => {
    const newItem = snap.data();
    const itemId = context.params.itemId;

    functions.logger.log(`New item created with ID: ${itemId}`, newItem);

    // --- 1. AI Tag Generation (Gemini Stub) ---
    // if (genAI) {
    //   try {
    //     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    //     const prompt = `Generate 3-5 relevant, single-word tags for this lost/found item. Return as a comma-separated list. Description: "${newItem.description}", Title: "${newItem.title}"`;
    //     const result = await model.generateContent(prompt);
    //     const response = result.response;
    //     const text = response.text();
    //     const tags = text.split(',').map((tag: string) => tag.trim().toLowerCase());
    //
    //     await snap.ref.update({ tags: tags });
    //     functions.logger.log(`Generated tags for ${itemId}:`, tags);
    //
    //   } catch (error) {
    //     functions.logger.error("Error with Gemini API:", error);
    //   }
    // }

    // --- 2. Basic Item Matching ---
    const oppositeType = newItem.type === "lost" ? "found" : "lost";
    const potentialMatches: string[] = [];

    const itemsRef = db.collection("items");
    const query = itemsRef
      .where("type", "==", oppositeType)
      .where("status", "==", "open");

    const querySnapshot = await query.get();
    querySnapshot.forEach((doc) => {
      const item = doc.data();
      // Basic matching logic: check for a keyword match in title/description
      const searchString = `${item.title} ${item.description}`.toLowerCase();
      const keywords = newItem.title.toLowerCase().split(" ");

      if (keywords.some((keyword: string) => searchString.includes(keyword))) {
        if (doc.id !== itemId) {
            potentialMatches.push(doc.id);
        }
      }
    });

    if (potentialMatches.length > 0) {
      await snap.ref.update({ potentialMatches });
      functions.logger.log(`Found ${potentialMatches.length} potential matches for ${itemId}`);
    }

    return null;
  });


/**
 * Email Notification Stub.
 * Triggered when a new message is added to a chat.
 */
export const onNewChatMessage = functions.firestore
  .document("chats/{chatId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const chatId = context.params.chatId;

    const chatDoc = await db.collection("chats").doc(chatId).get();
    const chatData = chatDoc.data();

    if (!chatData) {
        functions.logger.error("Chat document not found for new message.");
        return;
    }

    const participants: string[] = chatData.participants;
    const recipientId = participants.find((p) => p !== message.senderId);

    if (!recipientId) return;

    const recipient = await admin.auth().getUser(recipientId);

    functions.logger.log(`New message from ${message.senderId} to ${recipientId}`);
    functions.logger.log(`TODO: Send email to ${recipient.email} with message text: "${message.text}"`);

    // TODO: Integrate with an email service like SendGrid or Nodemailer.
    // Example:
    // await sendEmail({
    //   to: recipient.email,
    //   subject: "You have a new message on Lost & Found",
    //   body: `You received a new message: "${message.text}". Go to the app to reply.`
    // });
  });

   