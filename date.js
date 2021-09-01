

var isPowerOfFour = function(n) {
  if((Math.log(n) / Math.log(4)) % 1 === 0 || n === 1){
      return true
  } 
  return false
  
};

console.log(isPowerOfFour(1024))