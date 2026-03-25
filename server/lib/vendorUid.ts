import { randomUUID } from 'crypto';

/**
 * Get or create a vendor UID from cookies
 * This function ensures vendor users always have a UID without requiring login
 */
export function getVendorUID(req: any, res: any): string {
  console.log('=== GET VENDOR UID DEBUG ===');
  console.log('Checking cookies:', req.cookies);
  console.log('Existing vendor_uid:', req.cookies?.vendor_uid);
  
  // Check if vendor_uid already exists in cookies
  let vendorUid = req.cookies?.vendor_uid;
  
  if (!vendorUid) {
    // Generate new vendor UID with "V_" prefix
    vendorUid = `V_${randomUUID()}`;
    console.log('Generated new vendor UID:', vendorUid);
    
    // Set cookie with 30 days expiry
    res.cookie('vendor_uid', vendorUid, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    console.log('Set vendor_uid cookie:', vendorUid);
  } else {
    console.log('Using existing vendor UID:', vendorUid);
  }
  
  console.log('Final vendor UID:', vendorUid);
  console.log('========================');
  
  return vendorUid;
}

/**
 * Helper function to get UID for any user (logged in or vendor)
 * Returns logged-in user ID if available, otherwise vendor UID
 */
export function getUIDForUser(req: any, res: any, loggedInUser?: any): string {
  console.log('=== GET UID FOR USER DEBUG ===');
  console.log('Logged in user:', loggedInUser?._id?.toString());
  console.log('Has vendor flow:', req.headers['x-vendor-flow'] === 'true');
  
  // If user is logged in, use their ID
  if (loggedInUser?._id) {
    console.log('Using logged-in user ID:', loggedInUser._id.toString());
    console.log('===========================');
    return loggedInUser._id.toString();
  }
  
  // Otherwise use vendor UID
  const vendorUid = getVendorUID(req, res);
  console.log('Using vendor UID:', vendorUid);
  console.log('===========================');
  return vendorUid;
}
