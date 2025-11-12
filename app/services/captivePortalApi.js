const API_BASE = 'http://localhost:3003/api/captiveportal/access';

export const captivePortalApi = {
  async logon(credentials) {
    const response = await fetch(`${API_BASE}/logon/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(credentials),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async status(zoneid = '') {
    const response = await fetch(`${API_BASE}/status/${zoneid}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async logoff(zoneid = '') {
    const response = await fetch(`${API_BASE}/logoff/${zoneid}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async modernPortalApi() {
    const response = await fetch(`${API_BASE}/modernapi/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};
