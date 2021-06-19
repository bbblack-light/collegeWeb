import React, { useState, useCallback, useMemo }  from 'react';
import Modal from 'react-modal';
//используем реакт хуки useState, useCallback, useMemo
import { createCn } from 'bem-react-classname';
import BackButton from '../back-button/backButton';
import { getAll, save, deleteById, isError, register, getUser} from '../../services/UserService';
import { useStateWithCallbackLazy } from 'use-state-with-callback';

import './students.css';

//инфа о конференс комнатах
export default function MasterClass(props) {
  const [user, setUser] = useState({role: ''})
  const [constructorHasRun, setConstructorHasRun] = useState(false); // флаг для понимания, отработал ли конструктор или нет
  const [isEdit, setIsEdit] = useState(false); // флаг для понимания, отработал ли конструктор или нет
  const [studentsInfo, setStudent] = useStateWithCallbackLazy ([]); // конференции
  const [modalIsOpen,setModalIsOpen] = useState(false); // флаг говорящий, открыто ли окно добавления
  const [filter, setFilter] = useState('');// filter = '' - изначально пустой. функция setFilter будет задавать фильтр и обновлять компонент после этого
  const [firstName, setFirstName] = useState('');// firstName = '' - изначально пустой. функция setFirstName будет задавать имя и обновлять компонент после этого
  const [lastName, setLastName] = useState('');// lastName = '' - изначально пустой. функция setLastName будет задавать фамилию и обновлять компонент после этого
  const [patronymic, setPatronymic] = useState('');// patronymic = '' - изначально пустой. функция setPatronymic будет задавать отчество и обновлять компонент после этого
  const [email, setEmail] = useState('');// email = '' - изначально пустой. функция setEmail будет задавать почту и обновлять компонент после этого
  const [studNumber, setstudNumber] = useState('');// studNumber = '' - изначально пустой. функция setstudNumber будет задавать номер студенческого и обновлять компонент после этого
  const [password, setPassword] = useState('');// password = '' - изначально пустой. функция setPassword будет задавать пароль и обновлять компонент после этого
  const [userId, setUserId] = useState(''); // userId = '' - изначально пустой. функция setUserId будет задавать логин и обновлять компонент после этого

  const handlePasswordChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с паролем
    setPassword(e.target.value);
  }, [setPassword]) //функция изменяется при изменении setPassword


  const handleStudNuberChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с номером студенческого
    setstudNumber(e.target.value);
  }, [setstudNumber]) //функция изменяется при изменении setstudNumber

  const handleUserIdChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с логином
    setUserId(e.target.value);
  }, [setUserId]) //функция изменяется при изменении setUserId

  const handleFirstNameChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с именем
    setFirstName(e.target.value);
  }, [setFirstName]) //функция изменяется при изменении setFirstName

  const handleLastNameChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с фамилием
    setLastName(e.target.value);
  }, [setLastName]) //функция изменяется при изменении setLastName

  const handlePatronimycChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с отчеством
    setPatronymic(e.target.value);
  }, [setPatronymic]) //функция изменяется при изменении setPatronymic

  const handleEmailChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с почтой
    setEmail(e.target.value);
  }, [setEmail]) //функция изменяется при изменении setEmail

  let cn = createCn('students'); //генерируем класс .conference,  все последующие вызовы cn('class') будут возвращать .conference__class

  const setModalIsOpenToTrue =()=>{ // открывает окно добавления
      setModalIsOpen(true)
  }

  const setModalIsOpenToTrueWithId = (stud) => {// открывает окно добавления при изменении студента
    setModalIsOpenToTrue();
    setUserId(stud.userId);//сохраняем себе значения для отображения в инпутах
    setLastName(stud.lastName);//сохраняем себе значения для отображения в инпутах
    setFirstName(stud.firstName);//сохраняем себе значения для отображения в инпутах
    setPatronymic(stud.patronymic)//сохраняем себе значения для отображения в инпутах
    setstudNumber(stud.studNumber);//сохраняем себе значения для отображения в инпутах
    setEmail(stud.email);//сохраняем себе значения для отображения в инпутах
    setIsEdit(true);//сохраняем себе значения для отображения в инпутах
  }

  const setModalIsOpenToFalse =()=>{ // загрывает окно добавления
      setModalIsOpen(false)
      setIsEdit(false);
  }

  const afterSave =(data, saveMC) => { //метод определяет сохранили студента или изменили аналогично конференциям, мастер классам и консультациям
    if (!isError(data)) {
      let isFind = false;
      setStudent(studentsInfo.map(stud=> {
        if (stud.userId==saveMC.userId) {
          stud = saveMC
          isFind = true;
        };
        return stud;
      }));
      if (!isFind) {
        studentsInfo.push(saveMC)
        setStudent(studentsInfo);
      }
      setUserId('');
      setLastName('');
      setFirstName('');
      setPatronymic('')
      setstudNumber('');
      setPassword('');
    } 
    setModalIsOpenToFalse(); // загрываем окно добавления
  }
  const saveMC =()=>{ // функция сохранения конференции
    let saveMC = {
      userId: userId, 
      lastName: lastName, 
      firstName: firstName,
      patronymic: patronymic, 
      email: email,
      studNumber: studNumber,
      password: password
    }
    if (isEdit) { // если изменям
      save(saveMC).then((data) => {// сохраняем
        afterSave(data,saveMC)
      });
    } else { // если создаем
      register(saveMC).then((data) => {// сохраняем
        afterSave(data,saveMC)
      });
    }
  }

  const deleteStud =(stud)=> { //метод удаления студента
    deleteById(stud.userId).then((data) => { // запрос на удаление 
      if (!isError(data))  //если ошибка
        setStudent(studentsInfo.filter(consulting => consulting.userId!=stud.userId));//заменить на список без удаленного пользователя
    })
  }

  const handleFilterChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с фильтром
    setFilter(e.target.value);
  }, [setFilter]) //функция изменяется при изменении setFilter

  const constructor = () => { // конструктор
    if (constructorHasRun) return; // если один раз сработал, то больше не вызывается
    getAll().then((data) => { // подгружаем с сервера всех студентов
      if (!isError(data)) 
        setStudent(data); // кладем данные в студентов после ассинхронно получения
    });
    getUser().then((data) => {
      if (!isError(data)) setUser(data);
    })
    setConstructorHasRun(true); // говорим, что конструктор отработал
  };

  constructor(); //отрабатывает при открытии страницы

  const renderStudents = useMemo(() => { //useMemo мемоизирует вычисления информации о конференс комнатах. Если пришли те же самые значения фунция вернет старое значение и не будет выполняться
    if (!filter) {
      return studentsInfo; //если фильтр пуст, то возвращаем все
    }
    const lowerFilter = filter.toLowerCase(); //приводим значение фильтра в нижний регистр
    return studentsInfo.filter(item => (item.firstName.toLowerCase()+' '+item.firstName.toLowerCase() + item.patronymic.toLowerCase()).includes(lowerFilter)) //ищем среди данных значения которые включают строку фильтра в именах
  }, [filter, studentsInfo]); //useMemo изменяется при изменении filter и conferenceInfo
  
  const addButton = () => {// метод возвращает верстку кнопок добавления и модального окна с полями для ввода данных
    if (user.role == 'ADMIN') { // если администратор
      return (
        <div>
          <button className={ cn('btn')} onClick={setModalIsOpenToTrue}>Добавить студента</button>
          
          <Modal isOpen={modalIsOpen} className={ cn('modal')}>
            <button onClick={setModalIsOpenToFalse}>x</button>
            <input
              type='text'
              placeholder='Имя'
              className={ cn('input') }
              value={firstName}
              onChange={handleFirstNameChange}
            />
            <input
              type='text'
              placeholder='Фамилия'
              className={ cn('input') }
              value={lastName}
              onChange={handleLastNameChange}
            />
            <input
              type='text'
              placeholder='Отчество'
              className={ cn('input') }
              value={patronymic}
              onChange={handlePatronimycChange}
            />
            <input
              type='text'
              placeholder='Номер студенческого'
              className={ cn('input') }
              value={studNumber}
              onChange={handleStudNuberChange}
            />
            <input
              type='text'
              placeholder='Логин'
              className={ cn('input') }
              value={userId}
              onChange={handleUserIdChange}
            />

            <input
              type='text'
              placeholder='Электронная почта'
              className={ cn('input') }
              value={email}
              onChange={handleEmailChange}
            />
            
            <input
              type='text'
              placeholder='Пароль'
              className={ cn('input') }
              value={password}
              onChange={handlePasswordChange}
            />
            <button className={ cn('btn')} onClick={saveMC}>Сохранить</button>
          </Modal>
        </div>
      );
    }
    return;
  };

  const renderEditButton =  (stud) => {// метод возвращает кнопки изменения, удаления стундентов
    if (user.role == 'ADMIN'){ // если администратор
      return (
      <div className={cn('item')}>
        <button  className={ cn('item_btn')} onClick={() => setModalIsOpenToTrueWithId(stud)}>Изменить</button>
        <button  className={ cn('item_btn')} onClick={() => deleteStud(stud)}>Удалить</button>
      </div>)
    }
  };

  const renderStudentsValue = useMemo(() => {//метод возвращает верстку информации о студентах
    if (studentsInfo!==undefined && studentsInfo.length!=0) {
      return renderStudents.map((stud) => {
        return(
          <div className={ cn('item-line') }>
            <div className={ cn('item') }>
              <span className={ cn('item-name') }>
                { (stud.firstName==null ? '' : stud.firstName)  + ' '+ 
                  (stud.lastName==null ? '' : stud.lastName) + ' ' + 
                  (stud.patronymic==null ? '' : stud.patronymic)}
              </span>
              <span className={ cn('item-info') }>
                { stud.email==null ? '' : stud.email + ' '}
              </span>
            </div>
            {renderEditButton(stud)}
          </div>
        )
      }) 
    }
    return (<p>Студентов пока нет!</p>);
  }, [renderStudents]);

  return (
    <div class={cn()}>
      <h2>Информация о студентах</h2>
      <BackButton to='/student' />
      <section className={ cn('filter')}>
        <input
          type='text'
          placeholder='Поиск'
          className={ cn('filter-search') }
          onChange={handleFilterChange}
        />
        { addButton() }
      </section>
      <section className={ cn('content') }>
        { renderStudentsValue }
      </section>
    </div>
  )
}
