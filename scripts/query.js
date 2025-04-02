// query.js

function queryData(data, filters) {
  // console.log(filters);
  return data.filter(item => {
    // we have to return true if the filters include the current item
    const nameMatch = item.data && item.data.name.toLowerCase().includes(filters.name);
    const typeMatch = filters.type.length === 0 || (item.data && filters.type.includes(item.data.type));
    const colorMatch = filters.color.length === 0 || (item.data && filters.color.includes(item.data.color));
    const categoryMatch = filters.category.length === 0 || 
        (item.data && item.data.categories && item.data.categories.some(cat => filters.category.includes(cat)));

    return nameMatch && typeMatch && colorMatch && categoryMatch;
  });
}


function queryDataForTeam(data, filter1, filter2) {
  // console.log(filter1,filter2);
  
  return data.filter(item => {
    if (!item.data){
      return false;
    }
    // the item should be included in both the filters
    let cat1 = filter1.categories.length === 0 || (item.data.categories && item.data.categories.some(cat => filter1.categories.includes(cat)));
    let cat2 = filter2.categories.length === 0 || (item.data.categories && item.data.categories.some(cat => filter2.categories.includes(cat)));
    let type1 = filter1.types.length === 0 || filter1.types.includes(item.data.type)
    let type2 = filter2.types.length === 0 || filter2.types.includes(item.data.type)
    let color1 = filter1.colors.length === 0 || filter1.colors.includes(item.data.color)
    let color2 = filter2.colors.length === 0 || filter2.colors.includes(item.data.color)
    
    // these force the category if no type and color is boosted
    const catOnly1 = filter1.colors.length === 0 && filter1.types.length === 0 
    const catOnly2 = filter2.colors.length === 0 && filter2.types.length === 0 
    
    const f1 = cat1 || (type1 && color1 && !catOnly1)
    const f2 = cat2 || (type2 && color2 && !catOnly2)
    return f1 && f2

  });
}
