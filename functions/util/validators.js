// Helper function to validate email syntax
const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

// Helper function to check for empty user entry
const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};

// validation for sign up
exports.validateSignupData = data => {
  // Validation of new user
  let errors = {};

  // checking that the email is not empty
  if (isEmpty(data.email)) {
    errors.email = "Must not be empty";
  }
  // checking that the email is valid
  else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }
  // checking that the password is not empty
  if (isEmpty(data.password)) errors.password = "Must not be empty";
  // checking that the password is more than 6 characters
  if (data.password.trim().length < 6)
    errors.password = "Must be more than 6 characters";
  // checking that the passwords match each other
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  // checking that the user handle is not empty
  if (isEmpty(data.handle)) errors.handle = "Must not be empty";

  // returns any user errors with email validation before entering into database
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

// validation for log in
exports.validateLoginData = data => {
  // Validation of user login
  let errors = {};

  // checking that the email is not empty
  if (isEmpty(data.email)) errors.email = "Must not be empty";
  // checking that the password is not empty
  if (isEmpty(data.password)) errors.password = "Must not be empty";

  // returns any user errors with the login validation before querying the database
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

// Helper Function to pull user's details
exports.reduceUserDetails = data => {
  let userDetails = {};
  userDetails.website = [];

  if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;

  if (data.website.length > 0) {
    data.website.forEach(website => {
      if (!isEmpty(website.trim())) {
        if (website.trim().substring(0, 4) !== "http") {
          userDetails.website.push(`http://${website.trim()}`);
        } else userDetails.website.push(website);
      }
    });
  }
  if (!isEmpty(data.location.trim())) userDetails.location = data.location;

  return userDetails;
};
