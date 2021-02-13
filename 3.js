function cetakPolaSegitigaPascalCostum(jumlahRow) {
    
  let arraySegitiga = [];
  for (let row = 1; row <= jumlahRow; row++) {
      let array = [];
      for (let col = 0; col < row; col++) {
          if (col === 0 || col === row -1) {
              array.push(1);
          } else {
              array.push((arraySegitiga[row-2][col-1] + arraySegitiga[row-2][col]));
          }
      }
      arraySegitiga.push(array);
  }
  return arraySegitiga;
  
}

console.log(cetakPolaSegitigaPascalCostum(6))