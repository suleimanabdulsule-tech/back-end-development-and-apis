function isPrime(number) {
  if (!Number.isSafeInteger(number) || number < 2) {
    return false;
  }

  for (let divisor = 2; divisor * divisor <= number; divisor += 1) {
    if (number % divisor === 0) {
      return false;
    }
  }

  return true;
}

module.exports.isPrime = isPrime;
