const BASE_URL = 'http://127.0.0.1:8000';

export const getPropertyDetail = (params) => {
  return fetch(`http://127.0.0.1:8000/property/details/${params}/`, {
    method: 'GET', 
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(data => data.json())
  .then((data) => {
    return data;
  } 
  )
}

export const getPropertyComments = (params) => {
  console.log(params)
  return fetch(`${BASE_URL}/comments/property/${params}/`, {
    method: 'GET', 
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(data => data.json())
  .then((data) => {
    console.log(data);
    return data;
  } 
  )
}

export const getOwnerInfo = (params) => {
  console.log(params)
  return fetch(`${BASE_URL}/accounts/getUser/${params}/`, {
    method: 'GET', 
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(data => data.json())
  .then((data) => {
    return data;
  } 
  )
}

export const getAvailable = (params) => {
  console.log(params)
  return fetch(`${BASE_URL}/property/getAva/${params}/`, {
    method: 'GET', 
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(data => data.json())
  .then((data) => {
    return data;
  } 
  )
}

export const deleteProperty = (params) => {
  return fetch(`${BASE_URL}/property/delete/${params}/`, {
    method: 'DELETE', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('access_token'),
    },
  })
  .then(data => data.json())
  .then((data) => {
    return data;
  } 
  )
}