
function cekMedian(params) {

  params.sort(function(a,b){
    return a-b;
  });

  var tengahAtas = Math.floor(params.length / 2);

  if (params.length % 2)
    return params[tengahAtas];

  return (params[tengahAtas - 1] + params[tengahAtas]) / 2.0;
}
console.log(cekMedian([0,1,2,4,6,5,3]))