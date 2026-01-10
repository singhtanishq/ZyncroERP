import axios from "axios";

const base = "";

const api = axios.create({
  baseURL: base + "/api",
  withCredentials: true,

  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

let csrfLoaded = false;

/*
 | Laravel rotates the CSRF token on login/logout (session regeneration),
 | so the XSRF cookie must be re-fetched before every authenticated write —
 | a cached token from page load is stale after the first auth cycle and
 | causes 419 "CSRF token mismatch". A very short cache only de-duplicates
 | parallel calls within the same instant.
 */
let csrfFetchedAt = 0;
const CSRF_CACHE_MS = 2000;

export async function ensureCsrf() {
  const now = Date.now();

  if (csrfLoaded && now - csrfFetchedAt < CSRF_CACHE_MS) return;

  await axios.get(base + "/sanctum/csrf-cookie", {
    withCredentials: true,
  });

  csrfLoaded = true;
  csrfFetchedAt = now;
}

/*
 | If a request still reaches the server with an out-of-date token
 | (e.g. another tab logged out), refresh the cookie once and retry.
 */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const config = error?.config;

    if (status === 419 && config && !config.__csrfRetried) {
      config.__csrfRetried = true;
      csrfLoaded = false;
      await ensureCsrf();
      return api.request(config);
    }

    return Promise.reject(error);
  }
);

/*
 | Expired/lost sessions surface as 401s. Send the user back to login
 | once (auth endpoints excluded to avoid redirect loops).
 */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    const isAuthCall =
      url.includes("/login") ||
      url.includes("/logout") ||
      url.includes("/user") ||
      url.includes("/send-otp") ||
      url.includes("/verify-otp") ||
      url.includes("/register") ||
      url.includes("/password");

    if (status === 401 && !isAuthCall && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/* ----- OTP helpers – CSRF-safe (login 2FA) ----- */

export async function sendOtp() {
  await ensureCsrf();
  return api.post("/send-otp");
}

export async function verifyOtp(code) {
  await ensureCsrf();
  return api.post("/verify-otp", { code });
}

// Cancel pending login
export async function cancelPendingLogin() {
  await ensureCsrf();
  return api.post("/login-cancel");
}

/* ----- Forgot password helpers ----- */

export async function forgotPasswordStart(email) {
  await ensureCsrf();
  const res = await api.post("/password/forgot-start", { email });
  return res.data;
}

export async function forgotPasswordSecurity({ dob, country, mobile }) {
  await ensureCsrf();
  const res = await api.post("/password/forgot-security", {
    dob,
    country,
    mobile,
  });
  return res.data;
}

export async function forgotPasswordVerify(code) {
  await ensureCsrf();
  return api.post("/password/forgot-verify", { code });
}

export async function resetPassword(password, passwordConfirmation) {
  await ensureCsrf();
  return api.post("/password/reset", {
    password,
    password_confirmation: passwordConfirmation,
  });
}

/* ----- Signup (register) helpers ----- */

export async function registerStart(name, email, role) {
  await ensureCsrf();
  return api.post("/register/start", { name, email, role });
}

export async function registerVerify(code) {
  await ensureCsrf();
  return api.post("/register/verify", { code });
}

export async function registerComplete(
  password,
  passwordConfirmation,
  dob,
  country,
  mobile
) {
  await ensureCsrf();
  return api.post("/register/complete", {
    password,
    password_confirmation: passwordConfirmation,
    dob,
    country,
    mobile,
  });
}

export const updateProfile = (data) =>
  api.put("/user/profile", data);

export const changePassword = (data) =>
  api.post("/user/change-password", data);

export const sendPasswordOtp = () =>
  api.post("/user/send-otp");

export const verifyOtpPassword = (data) =>
  api.post("/user/verify-otp-password", data);

export default api;
