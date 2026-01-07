export async function getAdminData() {
  try {
    if (typeof window === "undefined") return null;

    const getCookie = (name) => {
      const match = document.cookie.split('; ').find(row => row.startsWith(name + '='));
      return match ? decodeURIComponent(match.split('=')[1]) : null;
    };

    const token = getCookie('token');

    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length < 2) throw new Error('Invalid token');
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        // backend stores user inside `data` key in the JWT payload
        if (payload && payload.data) {
          console.log("Admin data from token:", payload.data);
          return payload.data;
        }
        console.log("Admin payload from token:", payload);
        return payload || null;
      } catch (e) {
        console.warn('Failed to decode token cookie, falling back to localStorage', e);
      }
    }
  } catch (error) {
    console.error("Error getting admin data from cookie/localStorage:", error);
    return null;
  }
}
