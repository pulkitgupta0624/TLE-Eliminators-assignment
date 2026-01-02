import axios from 'axios';
import { config } from '../config/environment.js';

class IpRiskService {
  constructor() {
    this.apiKey = config.vpnApiKey;
    this.baseUrl = 'https://vpnapi.io/api';
  }

  async analyzeIp(ipAddress) {
    if (this.isPrivateIp(ipAddress)) {
      return { isRisky: false, riskReason: null, details: null };
    }

    if (!this.apiKey) {
      console.warn('VPN_API_KEY missing. Skipping IP check.');
      return { isRisky: false, riskReason: null, details: null };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/${ipAddress}?key=${this.apiKey}`);
      const security = response.data.security;
      const locationData = response.data.location;

      const isRisky = security.vpn || security.proxy || security.tor || security.relay;

      let riskReason = null;
      if (isRisky) {
        const reasons = [];
        if (security.vpn) reasons.push('VPN Detected');
        if (security.proxy) reasons.push('Proxy Detected');
        if (security.tor) reasons.push('Tor Exit Node');
        if (security.relay) reasons.push('Relay Detected');
        riskReason = reasons.join(', ');
      }

      return {
        isRisky,
        riskReason,
        details: security,
        // Map their API format to your database format
        location: {
          country: locationData.country,
          city: locationData.city,
          latitude: parseFloat(locationData.latitude),
          longitude: parseFloat(locationData.longitude),
          timezone: locationData.time_zone
        }
      };
    } catch (error) {
      console.error(`IP check failed for ${ipAddress}:`, error.message);
      return { isRisky: false, riskReason: null, details: null };
    }
  }

  isPrivateIp(ip) {
    return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.');
  }
}

export default new IpRiskService();