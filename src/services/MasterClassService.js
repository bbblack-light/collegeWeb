import axios from 'axios';
import config from '../config';

function token () {// получение токена
  if (localStorage.getItem('token')!=null){
    return {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }
  }
  else return {}
}

export async function getAll() { //функция получения данных с сервера
    let data;
    try {
      const resp = await axios.get(config.springUrl + '/master-class/', token());
      data =resp.data.map(cons => {
        cons.date = new Date(cons.date)
        return cons;
      });//данные из ответа
    } catch(e) {
      data = e;
      console.log('не получилось загрузить мастер-классы ' + e, token());
    }
    return data;
}

export async function  save(consulting) { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.post(config.springUrl + '/master-class/', consulting, token());
    data =resp.data;//данные из ответа
  } catch(e) {
    data = e;
    console.log('не получилось сохранить мастер-класс ' + e);
  }
  return data;
}

export async function  addJoin(mcId, userId) { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.get(config.springUrl + '/master-class/'+mcId +'/' + userId, token());
    data =resp.data;//данные из ответа
  } catch(e) {
    data = e;
    console.log('не удалось записаться мастер-класс ' + e);
  }
  return data;
}

export async function  deleteJoin(mcId, userId) { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.delete(config.springUrl + '/master-class/'+mcId +'/' + userId, token());
    data =resp.data;//данные из ответа
  } catch(e) {
    data = e;
    console.log('не отказаться от записи на мастер-класс ' + e);
  }
  return data;
}

export async function deleteById(id) { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.delete(config.springUrl + '/master-class/'+id, token());
    data =resp.data;//данные из ответа
  } catch(e) {
    data = e;
    console.log('не получилось удалить мастер-класс ' + e);
  }
  return data;
}

export function isError(e){
  return e && e.stack && e.message && typeof e.stack === 'string' 
         && typeof e.message === 'string';
}