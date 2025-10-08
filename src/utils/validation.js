export const validateAadhar = (aadharNumber) => {
  const aadharRegex = /^\d{4}-\d{4}-\d{4}$/;
  if (!aadharRegex.test(aadharNumber)) {
    return {
      isValid: false,
      error: 'Invalid Aadhar format. Use XXXX-XXXX-XXXX format'
    };
  }
  return { isValid: true };
};

export const validateAddress = (address) => {
  const errors = {};
  
  if (!address.street || address.street.length < 5) {
    errors.street = 'Street address must be at least 5 characters long';
  }
  
  if (!address.city || address.city.length < 2) {
    errors.city = 'City name must be at least 2 characters long';
  }
  
  if (!address.state || address.state.length < 2) {
    errors.state = 'State name must be at least 2 characters long';
  }
  
  const pincodeRegex = /^\d{6}$/;
  if (!address.pincode || !pincodeRegex.test(address.pincode)) {
    errors.pincode = 'Invalid pincode format. Must be 6 digits';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateDocument = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.push('File size must be less than 5MB');
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type must be JPEG, PNG, or PDF');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateName = (name) => {
  if (!name || name.length < 3) {
    return {
      isValid: false,
      error: 'Name must be at least 3 characters long'
    };
  }
  
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      error: 'Name can only contain letters and spaces'
    };
  }
  
  return { isValid: true };
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return {
      isValid: false,
      error: 'Invalid phone number. Must be 10 digits starting with 6-9'
    };
  }
  return { isValid: true };
};

export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }
  return { isValid: true };
};