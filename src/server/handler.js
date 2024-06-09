import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  collection,
  addDoc,
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlMZeBuf_Ocs6JAy2GxeG8F-ofGWWzeac",
  authDomain: "affable-tangent-425912-a5.firebaseapp.com",
  projectId: "affable-tangent-425912-a5",
};

// Initialize Firebase only once
let firebaseApp;
let auth;
let firestore;
let googleProvider;

const initFirebase = (config = {}) => {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    googleProvider = new GoogleAuthProvider();

    // Initialize Firestore with a non-default database if provided
    if (config.databaseId) {
      firestore = initializeFirestore(
        firebaseApp,
        {
          ignoreUndefinedProperties: true,
        },
        config.databaseId
      );
    } else {
      firestore = getFirestore(firebaseApp);
    }
  }
  return { auth, firestore, googleProvider };
};

// Registration handler
export const register = async (request, h) => {
  const { email, password, repassword } = request.payload;

  if (password !== repassword) {
    return h
      .response({
        status: "fail",
        message: "Passwords do not match",
      })
      .code(400);
  }

  const { auth, firestore } = initFirebase({
    databaseId: "register", // Use the non-default database ID
  });

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const userData = {
      uid: userCredential.user.uid,
      email: email,
    };

    const userRef = await addDoc(collection(firestore, "users"), userData);
    userData.id = userRef.id;

    return h
      .response({
        status: "success",
        message: "Registration successful",
        data: {
          uid: userData.uid,
          email: userData.email,
        },
      })
      .code(201);
  } catch (error) {
    console.error(error);
    return h
      .response({
        status: "fail",
        message: "Registration failed",
      })
      .code(400);
  }
};

// Google login handler
export const loginGoogle = async (request, h) => {
  const { auth, googleProvider } = initFirebase();

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const userCredential = result;
    const userData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
    };

    return h
      .response({
        status: "success",
        message: "Login successful",
        data: userData,
      })
      .code(200);
  } catch (error) {
    console.error(error);
    return h
      .response({
        status: "fail",
        message: "Login failed",
      })
      .code(401);
  }
};

// Email login handler
export const loginEmail = async (request, h) => {
  const { email, password } = request.payload;
  const { auth } = initFirebase();

  if (email && password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userData = {
        uid: userCredential.user.uid,
        email: email,
      };

      return h
        .response({
          status: "success",
          message: "Login successful",
          data: userData,
        })
        .code(200);
    } catch (error) {
      console.error(error);
      return h
        .response({
          status: "fail",
          message: "Login failed",
        })
        .code(401);
    }
  } else {
    return h
      .response({
        status: "fail",
        message: "Please provide email and password",
      })
      .code(400);
  }
};
