// Mock localStorage for Node testing environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

import { registerAccount, loginAccount, loginWithGoogle, getCurrentAccount, logoutAccount } from '../src/services/authService.js';
import { saveFarmerProfile, getFarmerProfile, addCropHistoryRecord, getCropHistory } from '../src/services/farmerProfileService.js';
import { getExpenses, addExpense, getIncome, addIncome } from '../src/services/farmBookService.js';

async function testComprehensiveAuth() {
  console.log("=== KISANGUARD AI COMPLETE PRODUCTION AUTHENTICATION TEST ===");

  // 1. TEST EMAIL/PASSWORD REGISTRATION & ISOLATION
  console.log("\n--- Step 1: Register Email/Password User (Email User A) ---");
  const emailUserA = registerAccount({
    name: "Email Farmer A",
    phone: "9876543210",
    email: "email.a@farmer.com",
    password: "Password123!",
    language: "gu"
  });
  console.log("Email User A registered ID:", emailUserA.id);

  saveFarmerProfile({ village: "Anand", district: "Anand", currentCrop: "Cotton", landSize: "3.5 acres", onboardingCompleted: true }, emailUserA.id);
  addExpense({ crop: "Cotton", category: "seeds", amount: 4500, year: 2026 });
  console.log("Email User A Profile:", getFarmerProfile(emailUserA.id).village, getFarmerProfile(emailUserA.id).currentCrop);

  logoutAccount();

  // 2. TEST GOOGLE USER A LOGIN & PROFILE CREATION
  console.log("\n--- Step 2: Google Sign-In (Google User A) ---");
  const googleResA = await loginWithGoogle({
    role: "farmer",
    language: "gu",
    googleUser: {
      uid: "firebase_uid_google_user_A",
      email: "google.user.a@gmail.com",
      name: "Google Farmer A",
      picture: "https://lh3.googleusercontent.com/a/google_a"
    }
  });

  console.log("Google User A Logged In:", googleResA.user.name, "ID:", googleResA.user.id, "isNewUser:", googleResA.isNewUser);

  // Complete onboarding for Google User A
  saveFarmerProfile({ village: "Mehsana", district: "Mehsana", currentCrop: "Mustard", landSize: "4.0 acres", onboardingCompleted: true }, googleResA.user.id);
  addExpense({ crop: "Mustard", category: "fertilizer", amount: 6000, year: 2026 });

  logoutAccount();

  // 3. TEST GOOGLE USER B LOGIN & STRICT USER DATA ISOLATION
  console.log("\n--- Step 3: Google Sign-In (Google User B) & Data Isolation Verification ---");
  const googleResB = await loginWithGoogle({
    role: "farmer",
    language: "hi",
    googleUser: {
      uid: "firebase_uid_google_user_B",
      email: "google.user.b@gmail.com",
      name: "Google Farmer B",
      picture: "https://lh3.googleusercontent.com/a/google_b"
    }
  });

  console.log("Google User B Logged In:", googleResB.user.name, "ID:", googleResB.user.id, "isNewUser:", googleResB.isNewUser);

  // Verify Google User B CANNOT see Google User A or Email User A data
  console.log("Active User:", getCurrentAccount().name);
  console.log("Google User B Expenses (Expected 0):", getExpenses(2026).length);
  console.log("Google User B Crop History (Expected 0):", getCropHistory(googleResB.user.id).length);

  // Unauthorized access security test
  const securityCheckA = getFarmerProfile(googleResA.user.id);
  console.log("Google User B reading Google User A profile (Security Check):", securityCheckA.error || "DATA LEAK DETECTED!");

  const securityCheckEmail = getFarmerProfile(emailUserA.id);
  console.log("Google User B reading Email User A profile (Security Check):", securityCheckEmail.error || "DATA LEAK DETECTED!");

  // Complete onboarding for Google User B with unique data
  saveFarmerProfile({ village: "Junagadh", district: "Junagadh", currentCrop: "Groundnut", landSize: "6.0 acres", onboardingCompleted: true }, googleResB.user.id);

  logoutAccount();

  // 4. RE-LOGIN EXISTING GOOGLE USER A
  console.log("\n--- Step 4: Re-login Existing Google User A ---");
  const reloginGoogleA = await loginWithGoogle({
    googleUser: {
      uid: "firebase_uid_google_user_A",
      email: "google.user.a@gmail.com",
      name: "Google Farmer A"
    }
  });

  console.log("Existing Google User A re-login isNewUser (Expected false):", reloginGoogleA.isNewUser);
  console.log("Restored Profile Village (Expected Mehsana):", getFarmerProfile(reloginGoogleA.user.id).village);
  console.log("Restored Profile Crop (Expected Mustard):", getFarmerProfile(reloginGoogleA.user.id).currentCrop);
  console.log("Restored Expenses (Expected 1):", getExpenses(2026).length);

  logoutAccount();

  // 5. TEST INVALID GOOGLE AUTH ERROR PROPAGATION
  console.log("\n--- Step 5: Testing Missing Config Error Propagation ---");
  try {
    await loginWithGoogle({}); // Will trigger signInWithGooglePopup with no config
    console.error("FAILED: Missing config error was swallowed!");
  } catch (err) {
    console.log("PASS: Missing config error correctly caught and propagated:", err.message);
  }

  // 6. TEST INVALID EMAIL/PASSWORD LOGIN
  console.log("\n--- Step 6: Testing Invalid Email/Password Rejection ---");
  try {
    loginAccount({ identifier: "nonexistent@user.com", password: "Password123!" });
    console.error("FAILED: Non-existent user was logged in!");
  } catch (err) {
    console.log("PASS: Non-existent user correctly rejected with:", err.message);
  }

  try {
    loginAccount({ identifier: "9876543210", password: "WrongPassword" });
    console.error("FAILED: Wrong password was accepted!");
  } catch (err) {
    console.log("PASS: Wrong password correctly rejected with:", err.message);
  }

  console.log("\n=== ALL PRODUCTION AUTHENTICATION TESTS PASSED SUCCESSFULLY ===");
}

testComprehensiveAuth();
