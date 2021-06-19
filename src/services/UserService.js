import axios from 'axios';
import config from '../config';

function token () {// получение токена
  if (localStorage.getItem('token')!='' && localStorage.getItem('token')!=null) {
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
      const resp = await axios.get(config.springUrl + '/users', token());
      data = resp.data; //данные из ответа
    } catch(e) {
      data = e;
      console.log('не получилось загрузить всех пользователей ' + e);
    }
    return data;
}


export async function getUser() { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.get(config.springUrl + '/user/', token());
    data = resp.data; //данные из ответа
  } catch(e) {
    data = e;
    console.log('не получилось загрузить всех пользователей ' + e);
  }
  return data;
}

export async function register(user) { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.post(config.springUrl + '/registration', user, token());
    data = resp.data; //данные из ответа
  } catch(e) {
    data = e;
    console.log('не получилось зарегистрировать пользователя ' + e);
  }
  return data;
}

export async function save(user) { //функция получения данных с сервера
  let data;
  try {
    const resp = await axios.post(config.springUrl + '/edit/user/', user, token());
    data = resp.data; //данные из ответа
  } catch(e) {
    data = e;
    console.log('не получилось сохранить пользователя ' + e);
  }
  return data;
}

export async function deleteById(id) { //функция получения данных с сервера
  let data;
  try {
    axios.head();
    console.log('спринг юрл');
    const resp = await axios.delete(config.springUrl + '/user/info/'+id, token());
    data =resp.data; //данные из ответа
  } catch(e) {
    data = e;
    console.log('не получилось удалить пользователя ' + e);
  }
  return data;
}

export async function loginUser(user) { //функция получения данных с сервера
  let data;
  try {
    console.log('спринг юрл');
    const resp = await axios.post(config.springUrl + '/session', user, token());
    data = resp.data; //данные из ответа
  } catch(e) {
    data = e;
    console.log('не получилось сохранить пользователя ' + e);
  }
  return data;
}

export function isError(e){
  return e && e.stack && e.message && typeof e.stack === 'string' 
    && typeof e.message === 'string';
}