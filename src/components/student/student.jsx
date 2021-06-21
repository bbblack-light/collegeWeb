import React, { useState, useCallback,useMemo} from 'react';
import { Link } from 'react-router-dom';
import { createCn } from 'bem-react-classname';
import BackButton from '../back-button/backButton';
import Modal from 'react-modal';
import { loginUser, isError, getUser } from '../../services/UserService';

import config from '../../config';

import './student.css'

export default function Student(props) {
  const [user, setUser] = useState({role: ''}) //user изначально с пустой ролью. Функция setUser будет задавать пользователя и обновлять компонент после этого
  const [errorMessage, setError] = useState(''); // errorMessage = '' - изначально пустой. функция setError будет задавать сообщение об ошибке и обновлять компонент после этого
  const [constructorHasRun, setConstructorHasRun] = useState(false); // флаг для понимания, отработал ли конструктор или нет
  const [modalIsOpen,setModalIsOpen] = useState(false); // флаг говорящий, открыто ли окно добавления
  const setModalIsOpenToTrue =()=>{ // открывает окно добавления
    setModalIsOpen(true)
  }
  const setModalIsOpenToFalse =()=>{ // загрывает окно добавления
    setModalIsOpen(false)
  }

  const [isLogin, setIsLogin] = useState(false);// isLogin = '' - изначально пустой. функция setIsLogin будет задавать залогинен ли пользователь или нет и обновлять компонент после этого
  const [login, setLogin] = useState('');// login = '' - изначально пустой. функция setLogin будет задавать логин и обновлять компонент после этого
  const [password, setPassword] = useState('');// password = '' - изначально пустой. функция setPassword будет задавать пароль и обновлять компонент после этого
  
  const handleLoginChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с логином
    setLogin(e.target.value);
  }, [setLogin]) //функция изменяется при изменении setLogin

  const handlePasswordChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с паролем
    setPassword(e.target.value);
  }, [setPassword]) //функция изменяется при изменении setPassword

  const loginIn = () => { // метод логинит пользователя на основе его логина и пароля
    let userData = { username: login, password: password } // копируем значения логина и пароля
    loginUser(userData).then((data)=> { //запрашиваем логин
      if (!isError(data)) { //если ошибка
        localStorage.setItem('token', data.item.token); // сохраняем токен
        setModalIsOpenToFalse(); //закрываем модальное окно
        setIsLogin(true); // ставим флаг на результат "АВТОРИЗОВАНО"
        getUser().then((data) => { // подгружаем пользователя
          if (!isError(data)) {
            setUser(data)
          }; // если вернулась не ошибка, то присваиваем user
        })
      }
      else {
        setError('Не получилось авторизоваться'); //выводим в консоль ошибку, если не получилось авторизоваться
      }
    })
  }

  const logOut = () => { // метод выхода из системы
    localStorage.removeItem('token'); //удаляем токен
    setIsLogin(false) //ставим флаг на результат "НЕ АВТОРИЗОВАНО"
  }


  let { state: {
    exams,
    libraryUrl,
    studentReminder,
    studentSchedule
  } } = props;
  
  const constructor = () => {
    if (constructorHasRun) return;
    setConstructorHasRun(true);
    if (localStorage.getItem('token')!=null) {
      setIsLogin(true);
    }
    getUser().then((data) => { // подгружаем пользователя
      if (!isError(data)) {
        setUser(data)
      }; // если вернулась не ошибка, то присваиваем user
    })
  }

  constructor();

  const loginFunc = () => {
    if (isLogin) return (
      <div>
        <button className={ cn('info-item') } onClick={logOut}>
          Выйти
        </button>
      </div>);
    
    return (
      <div>
        <button className={ cn('info-item') } onClick={setModalIsOpenToTrue}>
          Логин
        </button>
        <Modal isOpen={modalIsOpen} className={ cn('modal')}>
            <button onClick={setModalIsOpenToFalse}>x</button>
            <input
              type='text'
              placeholder='Логин'
              className={ cn('input') }
              value={login}
              onChange={handleLoginChange}
            />
            <input
              type='text'
              placeholder='Пароль'
              className={ cn('input') }
              value={password}
              onChange={handlePasswordChange}
            />
            <p  className={ cn('error')}>{ errorMessage }</p>
            <button className={ cn('btn')} onClick={loginIn}>Войти</button>
          </Modal>
      </div>
    )
  }

  const logButtons = () => {
    if (isLogin)
    return (
      <div>
        <Link to='/conference' className={ cn('info-item') }>
           Список конференс комнат
         </Link>

        <Link to='/consulting' className={ cn('info-item') }>
              Список консультаций
        </Link>

        <Link to='/master-class' className={ cn('info-item') }>
              Список мастер классов
        </Link>
        {
          user.role=='ADMIN' && 
          (<Link to='/students' className={ cn('info-item') }>
          Список студентов
          </Link>)
        }
      </div>
    )
  };

  const cn = createCn('student');
  return (
    <div className={ cn() }>
      <h2>Информация для студентов</h2>
      <BackButton to='/' />
      <div>
        {logButtons()}

        {libraryUrl && (
          <a
            href={libraryUrl}
            target='blank'
            className={ cn('info-item') }>
            Перейти в библиотеку
          </a>
        )}

        { studentSchedule && (
          <Link to='/schedule' className={ cn('info-item') }>
            Расписания
          </Link>
        )}

        { exams && (
          <Link to='/exam' className={ cn('info-item') }>
            Экзамены
          </Link>
        )}

        {studentReminder && (
          <a href={config.reminder} target='download' className={ cn('info-item') }>
            Памятка студента
          </a>
        )}
        { loginFunc () }
      </div>
    </div>
  )
}