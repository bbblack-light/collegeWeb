import axios from 'axios';
import config from './../config';

function token () {
  if (localStorage.getItem('token')!=null){
    return {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }
  }
  else return {}
}

export async function  getAll() { //функция получения данных с сервера
    let data;
    try {
      const resp = await axios.get(config.springUrl + '/conference/', token());
      data =resp.data;//данные из ответа
    } catch(e) {
      data = e;
      console.log('не получилось загрузить конференции ' + e);
    }
    return data;
}

export async function  save(conference) { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.post(config.springUrl + '/conference/', conference, token());
    data =resp.data;//данные из ответа
  } catch(e) {
    data = e;
    console.log('не получилось загрузить конференции ' + e);
  }
  return data;
}

export async function deleteById(id) { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.delete(config.springUrl + '/conference/'+id, token());
    data =resp.data;//данные из ответа
  } catch(e) {
    data = e;
    console.log('не получилось загрузить конференции ' + e);
  }
  return data;
}

export function isError(e){
  return e && e.stack && e.message && typeof e.stack === 'string' 
         && typeof e.message === 'string';
 }