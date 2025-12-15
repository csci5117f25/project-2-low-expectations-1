// /**
//  * Import function triggers from their respective submodules:
//  *
//  * const {onCall} = require("firebase-functions/v2/https");
//  * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */

// const {setGlobalOptions} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/https");
// const logger = require("firebase-functions/logger");

// // For cost control, you can set the maximum number of containers that can be
// // running at the same time. This helps mitigate the impact of unexpected
// // traffic spikes by instead downgrading performance. This limit is a
// // per-function limit. You can override the limit for each function using the
// // `maxInstances` option in the function's options, e.g.
// // `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// // NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// // functions should each use functions.runWith({ maxInstances: 10 }) instead.
// // In the v1 API, each function can only serve one request per container, so
// // this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 });

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

// // exports.helloWorld = onRequest((request, response) => {
// //   logger.info("Hello logs!", {structuredData: true});
// //   response.send("Hello from Firebase!");
// // });


import { onCall, HttpsError } from "firebase-functions/v2/https";
import speech from "@google-cloud/speech";

// Initialize the Google Speech Client
const client = new speech.SpeechClient();

export const transcribeAudio = onCall(async (request) => {
  const audioContent = request.data.audio;

  if (!audioContent) {
    throw new HttpsError("invalid-argument", "No audio data provided");
  }

  const config = {
    encoding: "WEBM_OPUS",
    sampleRateHertz: 48000,
    languageCode: "en-US",
    enableAutomaticPunctuation: true
  };

  const speechRequest = {
    audio: { content: audioContent },
    config: config,
  };

  try {
    const [response] = await client.recognize(speechRequest);

    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    return { success: true, text: transcription };

  } catch (error) {
    console.error("Speech API Error:", error);
    throw new HttpsError("internal", "Transcription failed: " + error.message);
  }
});
