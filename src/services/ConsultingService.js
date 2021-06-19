import axios from 'axios';
import config from '../config';

function token () { // получение токена
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
      const resp = await axios.get(config.springUrl + '/consulting/', token());
      data =resp.data.map(cons => {
        cons.date = new Date(cons.date)
        return cons;
      });//данные из ответа
    } catch(e) {
      data = e;
      console.log('не получилось загрузить консультации ' + e, token());
    }
    return data;
}

export async function save(consulting) { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.post(config.springUrl + '/consulting/', consulting, token());
    data =resp.data;//данные из ответа
  } catch(e) {
    data = e;
    console.log('не получилось сохранить консультацию ' + e);
  }
  return data;
}

export async function deleteById(id) { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.delete(config.springUrl + '/consulting/'+id, token());
    data =resp.data;//данные из ответа
  } catch(e) {
    data = e;
    console.log('не получилось удалить консультацию ' + e);
  }
  return data;
}

export async function  addJoin(consId, userId) { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.get(config.springUrl + '/consulting/'+consId +'/' + userId, token());
    data =resp.data;//данные из ответа
  } catch(e) {
    data = e;
    console.log('не удалось записаться на консультацию ' + e);
  }
  return data;
}


export async function deleteJoin(consId, userId) { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.delete(config.springUrl + '/consulting/'+consId +'/' + userId, token());
    data =resp.data;//данные из ответа
  } catch(e) {
    data = e;
    console.log('не удалось отказаться от записи на консультацию ' + e);
  }
  return data;
}


export function isError(e){
  return e && e.stack && e.message && typeof e.stack === 'string' 
         && typeof e.message === 'string';
 }