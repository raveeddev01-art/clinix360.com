function isEmail(value = "") {
  return value.length > 0 && /.+@.+\..+/.test(value);
}

export { isEmail };
