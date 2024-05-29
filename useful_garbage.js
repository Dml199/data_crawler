
function iterator(callback,iterated_elem ) {
    let result = []
 
  for ( let i = 0; i < iterated_elem.length ; i++)
    {
     result.push(callback(iterated_elem[i]))
    }
  
    return result
  }
 
 