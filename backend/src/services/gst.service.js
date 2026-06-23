const axios = require('axios');
const config = require('../config/env');

let accessToken = null;
let tokenExpiry = 0;

const getAccessToken = async () => {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post('https://commonapi.mastersindia.co/oauth/access_token', {
      username: config.mastersIndia.username,
      password: config.mastersIndia.password,
      client_id: config.mastersIndia.clientId,
      client_secret: config.mastersIndia.clientSecret,
      grant_type: 'password'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    accessToken = response.data.access_token;
    // expires_in is usually in seconds (e.g. 14400), multiply by 1000 for ms. Subtract 60s buffer.
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
    
    return accessToken;
  } catch (error) {
    console.error('[GST Service] Failed to obtain access token:', error.response?.data || error.message);
    throw new Error('GST_AUTH_FAILED');
  }
};

const formatAddress = (addrObj) => {
  if (!addrObj) return '';
  const fields = [
    addrObj.bno,
    addrObj.flno,
    addrObj.bnm,
    addrObj.st,
    addrObj.loc,
    addrObj.city,
    addrObj.dst,
    addrObj.stcd,
    addrObj.pncd
  ];
  return fields
    .filter(field => field && String(field).trim() !== '')
    .map(field => String(field).trim())
    .join(', ');
};

const verifyGST = async (gstNumber) => {
  if (!gstNumber || gstNumber.length < 15) {
      throw new Error('INVALID_GST_NUMBER');
  }

  try {
    const token = await getAccessToken();
    console.log("Token received:", token);
    
    const response = await axios.get(`https://commonapi.mastersindia.co/commonapis/searchgstin?gstin=${gstNumber.toUpperCase()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'client_id': config.mastersIndia.clientId,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.error) {
      throw new Error(response.data.message || 'INVALID_GST_NUMBER');
    }

    const data = response.data.data;
    if (!data) {
      throw new Error('INVALID_GST_NUMBER');
    }

    const tradeName = data.tradeNam || data.lgnm || '';
    const legalName = data.lgnm || data.tradeNam || '';
    const companyType = data.ctb || 'Regular';
    
    // Sometimes addr is an array or object. The API docs say "addr": {} inside "pradr"
    const addrObj = data.pradr && data.pradr.addr ? data.pradr.addr : {};
    const address = formatAddress(addrObj);
    
    return {
      gstNumber: data.gstin || gstNumber.toUpperCase(),
      legalName: legalName,
      tradeName: tradeName,
      businessType: companyType, // Keeping this for backward compatibility
      companyType: companyType, // Added specific companyType
      address: address || 'N/A',
      stateCode: data.stjCd || gstNumber.substring(0, 2),
      stateName: addrObj.stcd || '',
      pincode: addrObj.pncd || '',
      gstStatus: data.sts || 'Active'
    };

  } catch (error) {
    console.error('[GST Service] Failed to verify GST:', error.response?.data || error.message);
    if (error.message === 'INVALID_GST_NUMBER') throw error;
    throw new Error('GST_VERIFICATION_FAILED');
  }
};

module.exports = {
  verifyGST
};
