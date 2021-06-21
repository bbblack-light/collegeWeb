import React, { useState, useCallback, useMemo }  from 'react';
import Modal from 'react-modal';
//используем реакт хуки useState, useCallback, useMemo
import { createCn } from 'bem-react-classname';
import { getUser} from '../../services/UserService';
import BackButton from '../back-button/backButton';
import { getAll, save, deleteById, isError, addJoin, deleteJoin} from '../../services/ConsultingService';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import DateTimePicker from 'react-datetime-picker'

import './consulting.css';

//инфа о конференс комнатах
export default function Consulting(props) {
  const [user, setUser] = useState({role: ''}) //user изначально с пустой ролью. Функция setUser будет задавать пользователя и обновлять компонент после этого
  const [constructorHasRun, setConstructorHasRun] = useState(false); // флаг для понимания, отработал ли конструктор или нет
  const [consultingInfo, setConsulting] = useStateWithCallbackLazy ([]); // конференции
  const [modalIsOpen,setModalIsOpen] = useState(false); // флаг говорящий, открыто ли окно добавления
  const [filter, setFilter] = useState('');// filter = '' - изначально пустой. функция setFilter будет задавать фильтр и обновлять компонент после этого
  const [teacherName, setTeacher] = useState('');// teacherName = '' - изначально пустой. функция setTeacher будет задавать преподавателя и обновлять компонент после этого
  const [discipline, setDiscipline] = useState('');// discipline = '' - изначально пустой. функция setDiscipline будет задавать предмет и обновлять компонент после этого
  const [date, setDate] = useState(new Date());// date - изначально сегодняшняя дата. функция setDate будет задавать дату и обновлять компонент после этого
  const [cabinet, setCabinet] = useState(1);// cabinet  изначально значение 1. функция setCabinet будет задавать кабинет и обновлять компонент после этого
  const [description, setDescription] = useState('');// description изначально пустой. функция setDescription будет задавать описание и обновлять компонент после этого
  const[id, setId] = useState(0);// id изначально значение 0. функция setId будет задавать id и обновлять компонент после этого

  const handleTeacherChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с учителем
    setTeacher(e.target.value);
  }, [setTeacher]) //функция изменяется при изменении setTeacher

  const handleDisciplineChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с предметом
    setDiscipline(e.target.value);
  }, [setDiscipline]) //функция изменяется при изменении setDiscipline

  const handleCabinetChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с кабинета
    setCabinet(e.target.value);
  }, [setCabinet]) //функция изменяется при изменении setCabinet

  const handleDescriptionChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с описанием
    setDescription(e.target.value);
  }, [setDescription]) //функция изменяется при изменении setDescription

  let cn = createCn('consulting'); //генерируем класс .conference,  все последующие вызовы cn('class') будут возвращать .conference__class

  const setModalIsOpenToTrue =()=>{ // открывает окно добавления
    setModalIsOpen(true)
  }

  const setModalIsOpenToTrueWithId = (cons) => {// открывает окно добавления при изменении консультации
    setModalIsOpenToTrue();
    setId(cons.id); //сохраняем себе значения для отображения в инпутах
    setDiscipline(cons.discipline); //сохраняем себе значения для отображения в инпутах
    setTeacher(cons.teacherName); //сохраняем себе значения для отображения в инпутах
    setCabinet(cons.cabinet); //сохраняем себе значения для отображения в инпутах
    setDescription(cons.description);//сохраняем себе значения для отображения в инпутах
    setDate(cons.date); //сохраняем себе значения для отображения в инпутах
  }

  const setModalIsOpenToFalse =()=>{ // загрывает окно добавления
    setModalIsOpen(false)
  }
  
  const saveConference =()=>{ // функция сохранения конференции
    let saveCons = { // инициализируем консультацию в виде отдельного объекта
      id: id, 
      teacherName: teacherName, 
      discipline: discipline,
      date: date, 
      description: description,
      cabinet: cabinet
    }

    save(saveCons).then((data) => {// сохраняем
      if (!isError(data)) { //если не ошибка
        let isFind = false; // флаг о нахождении консультации в списках консультаций
        setConsulting(consultingInfo.map(conf=> {// заменяем консультацию, если ее изменяли
          if (conf.id==saveCons.id) {
            conf = saveCons; // заменяем консультацию, если ее нашли
            isFind = true; // если нашли консультацию в списках консультаций, то флаг говорит "НАЙДЕНО"
          };
          return conf;
        }));
        if (!isFind) { // если не нашли конференцию 
          consultingInfo.push(data) // то заменяем ее
          setConsulting(consultingInfo); // и обновляем список конференций
        }
        setId(0); // сбрасываем значения
        setDate(new Date()); // сбрасываем значения
        setTeacher(''); // сбрасываем значения
        setDescription(''); // сбрасываем значения
        setCabinet(0); // сбрасываем значения
        setDiscipline(''); // сбрасываем значения
      } 
      setModalIsOpenToFalse(); // загрываем окно добавления
    })
  }

  const deleteCons = (cons)=> { //функция удаления консультации
    deleteById(cons.id).then((data) => { //запрос на удаление
      if (!isError(data)) //если ошибка
        setConsulting(consultingInfo.filter(consulting => consulting.id!=cons.id)); //заменить на список без удаленной консультации
    })
  }

  const handleFilterChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с фильтром
    setFilter(e.target.value);
  }, [setFilter]) //функция изменяется при изменении setFilter

  const constructor = () => { // конструктор
    if (constructorHasRun) return; // если один раз сработал, то больше не вызывается
    getAll().then((data) => { // подгружаем с сервера все консультации
      if (!isError(data)) 
        setConsulting(data); // кладем данные в консультации после ассинхронно получения
    });
    
    getUser().then((data) => { // подгружаем пользователя
      if (!isError(data)) setUser(data); // если вернулась не ошибка, то присваиваем user
    })
    setConstructorHasRun(true); // говорим, что конструктор отработал
  };

  constructor(); //отрабатывает при открытии страницы

  const renderConsulting = useMemo(() => { //useMemo мемоизирует вычисления информации о конференс комнатах. Если пришли те же самые значения фунция вернет старое значение и не будет выполняться
    if (!filter) {
      return consultingInfo; //если фильтр пуст, то возвращаем все
    }
    const lowerFilter = filter.toLowerCase(); //приводим значение фильтра в нижний регистр
    return consultingInfo.filter(item => item.teacherName.toLowerCase().includes(lowerFilter)) //ищем среди данных значения которые включают строку фильтра в именах
  }, [filter, consultingInfo]); //useMemo изменяется при изменении filter и conferenceInfo
  
  let addButton = () => { // метод возвращает верстку кнопок добавления и модального окна с полями для ввода данных
    if (user.role=='ADMIN') { // если администратор
      return (
        <div>
          <button className={ cn('btn')} onClick={setModalIsOpenToTrue}>Добавить коснультацию</button>
          
          <Modal isOpen={modalIsOpen} className={ cn('modal')}>
            <button onClick={setModalIsOpenToFalse}>x</button>
            <input
              type='text'
              placeholder='Имя преподавателя'
              className={ cn('input') }
              value={teacherName}
              onChange={handleTeacherChange}
            />
            <input
              type='text'
              placeholder='Описание'
              className={ cn('input') }
              value={description}
              onChange={handleDescriptionChange}
            />
            <input
              type='text'
              placeholder='Дисциплина'
              className={ cn('input') }
              value={discipline}
              onChange={handleDisciplineChange}
            />
            <input
              type='text'
              placeholder='Кабинет'
              className={ cn('input') }
              value={cabinet}
              onChange={handleCabinetChange}
            />
            <DateTimePicker value={date} onChange={setDate} />
            <button className={ cn('btn')} onClick={saveConference}>Сохранить</button>
          </Modal>
        </div>
      );
    }
    return;
  };

  const record = (cons) => { // метод записи на консультацию
    addJoin(cons.id, user.userId).then((data) => { // запрос за запись
      if (!isError(data)) { //если не ошибка
        cons.users.push({masterClassId: cons.id, userId:user.userId}) //кладем пользователя, если он записался
        setConsulting([]); // обновляем список консультаций
        setConsulting(consultingInfo); // обновляем список консультаций
      }
    })
  }

  const unrecord = (cons) => { // метод отказа записи на консультацию
    deleteJoin(cons.id, user.userId).then((data) => {// запрос на отказ записи
      if (!isError(data)) { //если не ошибка
        cons.users = cons.users.filter(us => us.userId != user.userId) //удаляем пользователя, если он отказался от записи
        setConsulting([]); // обновляем список консультаций
        setConsulting(consultingInfo); // обновляем список консультаций
      }
    })
  }

  const renderEditButton = (cons) => { // метод возвращает кнопки изменения, удаления конференци
    if (user.role == 'ADMIN'){ // если администратор
      return (
      <div className={cn('item')}>
        <button  className={ cn('item_btn')} onClick={() => setModalIsOpenToTrueWithId(cons)}>Изменить</button>
        <button  className={ cn('item_btn')} onClick={() => deleteCons(cons)}>Удалить</button>
      </div>)
    }
    if (user.role == 'STUDENT') { // если это студент
      if (cons.users.filter(us => us.userId == user.userId).length==0) { //если его не нашли в списке записанных
        return (<div className={cn('item')}>
          <button  className={ cn('item_btn')} onClick={() => record(cons)}>Записаться</button>
        </div>)
      }
      else { //если его нашли в списке записанных
        return (<div className={cn('item')}>
          <button  className={ cn('item_btn')} onClick={() => unrecord(cons)}>Отменить запись</button>
        </div>)
      }
      
    }
  }
  const renderConferenceValue = () => { //метод возвращает верстку информации о конференциях
    if (consultingInfo!==undefined && consultingInfo.length!=0) {
      return renderConsulting.map((conf) => {
        return(
          <div className={ cn('item-line') }>
            <div className={ cn('item') }>
              <span className={ cn('item-name') }>
                { conf.teacherName }
              </span>
              <span className={ cn('item-info') }>
                { conf.discipline + ' '}
              </span>
              <p className={ cn('item-info') }>
                { conf.cabinet + ' кабинет '}
              </p>
              <p className={ cn('item-info') }>
                { conf.description + ' '}
              </p>
              <p className={ cn('item-info') } title={ conf.date + ' '}>
                {new Intl.DateTimeFormat('ru-RU', { 
                  month: 'long', 
                  day: '2-digit',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric'
                }).format(new Date(conf.date))}
              </p>
            </div>
            {renderEditButton(conf)}
          </div>
        )
      }) 
    }
    return (<p>Консультаций пока нет!</p>);
  }

  return (
    <div class={cn()}>
      <h2>Информация по консультациях с преподавателями</h2>
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
        { renderConferenceValue() }
      </section>
    </div>
  )
}
