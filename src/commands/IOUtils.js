function getNameFromPath(path) {
    const names1 = path.split("\\");
    const names2 = names1[names1.length - 1].split("/");
    return names2[names2.length - 1];
  }
  
  function getKeyFromPath(path) {
    const names1 = path.split("\\");
    if (names1.length > 1) {
      return names1[names1.length - 2];
    } else {
      const names2 = path.split("/");
      return names2[names2.length - 2];
    }
  }
  
  //put valid keys into a pattern string for directory traversal and validation
  function getValidKeyPattern(validKeys) {
    //valid key patterns
    let pattern = "@(";
    validKeys.forEach(key => {
      pattern = pattern + key + "|";
    });
    return pattern.substring(0, pattern.length - 1) + ")";
}

export default Utils;