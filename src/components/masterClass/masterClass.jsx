import React, { useState, useCallback, useMemo,useReducer }  from 'react';
import Modal from 'react-modal';
//используем реакт хуки useState, useCallback, useMemo
import { createCn } from 'bem-react-classname';
import BackButton from '../back-button/backButton';
import { getAll, save, deleteById, isError,addJoin, deleteJoin} from '../../services/MasterClassService';
import { getUser} from '../../services/UserService';
import DateTimePicker from 'react-datetime-picker'

import './masterClass.css';

//инфа о конференс комнатах
export default function MasterClass(props) {
  const [user, setUser] = useState({role: ''}) //user изначально с пустой ролью. Функция setUser будет задавать пользователя и обновлять компонент после этого
  const [constructorHasRun, setConstructorHasRun] = useState(false); // флаг для понимания, отработал ли конструктор или нет
  const [masterClassInfo, setMasterClass] = useState ([]); // конференции
  const [modalIsOpen,setModalIsOpen] = useState(false); // флаг говорящий, открыто ли окно добавления
  const [filter, setFilter] = useState(''); // filter = '' - изначально пустой. функция setFilter будет задавать фильтр и обновлять компонент после этого
  const [speakerName, setSpeakerName] = useState('');// speakerName  изначально пустой. функция setSpeakerName будет задавать имя спикера и обновлять компонент после этого
  const [title, setTitle] = useState(''); // title изначально пустой. функция setTitle будет задавать название и обновлять компонент после этого
  const [date, setDate] = useState(new Date()); // date изначально сегодняшняя дата. функция setDate будет задавать дату и обновлять компонент после этого
  const [cabinet, setCabinet] = useState(1); // cabinet изначально значение 1. функция setCabinet будет задавать кабинет и обновлять компонент после этого
  const [description, setDescription] = useState(''); // description изначально пустой. функция setDescription будет задавать описание и обновлять компонент после этого
  const[id, setId] = useState(0); // id изначально значение 0. функция setId будет задавать id и обновлять компонент после этого

  const handleSpeakerChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с именем спикера
    setSpeakerName(e.target.value);
  }, [setSpeakerName]) //функция изменяется при изменении setSpeakerName

  const handleTitleChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с названием
    setTitle(e.target.value);
  }, [setTitle]) //функция изменяется при изменении setTitle

  const handleCabinetChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с кабинетом
    setCabinet(e.target.value);
  }, [setCabinet]) //функция изменяется при изменении setCabinet

  const handleDescriptionChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с описанием
    setDescription(e.target.value);
  }, [setDescription]) //функция изменяется при изменении setDescription

  let cn = createCn('master-class'); //генерируем класс .master-class,  все последующие вызовы cn('class') будут возвращать .master-class__class

  const setModalIsOpenToTrue =()=>{ // открывает окно добавления
      setModalIsOpen(true)
  }

  const setModalIsOpenToTrueWithId = (cons) => {// открывает окно добавления при изменении мастер класса
    setModalIsOpenToTrue();
    setId(cons.id); //сохраняем себе значения для отображения в инпутах
    setTitle(cons.title); //сохраняем себе значения для отображения в инпутах
    setSpeakerName(cons.speakerName); //сохраняем себе значения для отображения в инпутах
    setCabinet(cons.cabinet); //сохраняем себе значения для отображения в инпутах
    setDescription(cons.description); //сохраняем себе значения для отображения в инпутах
    setDate(cons.date); //сохраняем себе значения для отображения в инпутах
  }

  const setModalIsOpenToFalse =()=>{ // загрывает окно добавления
      setModalIsOpen(false)
  }
  
  const saveMC =()=>{ // функция сохранения конференции
    let saveMC = {
      id: id, 
      speakerName: speakerName, 
      title: title,
      date: date, 
      description: description,
      cabinet: cabinet
    }

    save(saveMC).then((data) => {// сохраняем
      if (!isError(data)) {
        let isFind = false;
        setMasterClass(masterClassInfo.map(conf=> {
          if (conf.id==saveMC.id) {
            conf = saveMC
            isFind = true;
          };
          return conf;
        }));
        if (!isFind) {
          saveMC.id = data.id;
          masterClassInfo.push(saveMC)
          setMasterClass(masterClassInfo);
        }
        setId(0);
        setDate(new Date());
        setSpeakerName('');
        setDescription('');
        setCabinet(0);
        setTitle('');
      } 
      setModalIsOpenToFalse(); // загрываем окно добавления
    })
  }

  const deleteCons =(cons)=> {//функция удаления мастер класса
    deleteById(cons.id).then((data) => {//запрос на удаление
      if (!isError(data)) //если ошибка
        setMasterClass(masterClassInfo.filter(consulting => consulting.id!=cons.id));//заменить на список без удаленного мастер класса
    })
  }

  const handleFilterChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с фильтром
    setFilter(e.target.value);
  }, [setFilter]) //функция изменяется при изменении setFilter

  const constructor = () => { // конструктор
    if (constructorHasRun) return; // если один раз сработал, то больше не вызывается
    getAll().then((data) => { // подгружаем с сервера все конференции
      if (!isError(data)) 
        setMasterClass(data); // кладем данные в конференции после ассинхронно получения
    });
    getUser().then((data) => { // подгружаем пользователя
      if (!isError(data)) setUser(data); // если вернулась не ошибка, то присваиваем user
    })
    setConstructorHasRun(true); // говорим, что конструктор отработал
  };

  constructor(); //отрабатывает при открытии страницы

  const renderConference = useMemo(() => { //useMemo мемоизирует вычисления информации о конференс комнатах. Если пришли те же самые значения фунция вернет старое значение и не будет выполняться
    if (!filter) {
      return masterClassInfo; //если фильтр пуст, то возвращаем все
    }
    const lowerFilter = filter.toLowerCase(); //приводим значение фильтра в нижний регистр
    return masterClassInfo.filter(item => item.teacherName.toLowerCase().includes(lowerFilter)) //ищем среди данных значения которые включают строку фильтра в именах
  }, [filter, masterClassInfo]); //useMemo изменяется при изменении filter и conferenceInfo
  
  let addButton = () => { // метод возвращает верстку кнопок добавления и модального окна с полями для ввода данных
    if (user.role == 'ADMIN') {// если администратор
      return (
        <div>
          <button className={ cn('btn')} onClick={setModalIsOpenToTrue}>Добавить мастер-класс</button>
          
          <Modal isOpen={modalIsOpen} className={ cn('modal')}>
            <button onClick={setModalIsOpenToFalse}>x</button>
            <input
              type='text'
              placeholder='Имя спикера'
              className={ cn('input') }
              value={speakerName}
              onChange={handleSpeakerChange}
            />
            <input
              type='text'
              placeholder='Название'
              className={ cn('input') }
              value={title}
              onChange={handleTitleChange}
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
              placeholder='Кабинет'
              className={ cn('input') }
              value={cabinet}
              onChange={handleCabinetChange}
            />
            <DateTimePicker value={date} onChange={setDate} />
            <button className={ cn('btn')} onClick={saveMC}>Сохранить</button>
          </Modal>
        </div>
      );
    }
    return;
  }

  const record = (mc) => {// метод записи на мастер-класс
    addJoin(mc.id, user.userId).then((data) => {// запрос за запись
      if (!isError(data)) { //если не ошибка
        mc.users.push({masterClassId: mc.id, userId:user.userId})//кладем пользователя, если он записался
        setMasterClass([]); // обновляем список мастер классов
        setMasterClass(masterClassInfo);// обновляем список  мастер классов
      }
    })
  }

  const unrecord = (mc) => {// метод отказа записи на консультацию
    deleteJoin(mc.id, user.userId).then((data) => {// запрос на отказ записи
      if (!isError(data)) { //если не ошибка
        mc.users = mc.users.filter(us => us.userId != user.userId); //удаляем пользователя, если он отказался от записи
        setMasterClass([]); // обновляем список  мастер классов
        setMasterClass(masterClassInfo); // обновляем список  мастер классов
      }
    })
  }

  const renderEditButton = (mc) => { // метод возвращает кнопки изменения, удаления мастер класса
    if (user.role == 'ADMIN'){// если администратор
      return (
      <div className={cn('item')}>
        <button  className={ cn('item_btn')} onClick={() => setModalIsOpenToTrueWithId(mc)}>Изменить</button>
        <button  className={ cn('item_btn')} onClick={() => deleteCons(mc)}>Удалить</button>
      </div>)
    }
    if (user.role == 'STUDENT') {// если это студент
      if (mc.users.filter(us => us.userId == user.userId).length==0) { //если его не нашли в списке записанных
        return (<div className={cn('item')}>
          <button  className={ cn('item_btn')} onClick={() => record(mc)}>Записаться</button>
        </div>)
      }
      else { //если его нашли в списке записанных
        return (<div className={cn('item')}>
          <button  className={ cn('item_btn')} onClick={() => unrecord(mc)}>Отменить запись</button>
        </div>)
      }
      
    }
  }
  const renderConferenceValue = useMemo(() => { //метод возвращает верстку информации о мастер-классах
    if (masterClassInfo!==undefined && masterClassInfo.length!=0) {
      return renderConference.map((mc) => {
        return(
          <div className={ cn('item-line') }>
            <div className={ cn('item') }>
              <span className={ cn('item-name') }>
                { mc.speakerName }
              </span>
              <span className={ cn('item-info') }>
                { mc.title + ' '}
              </span>
              <p className={ cn('item-info') }>
                { mc.cabinet + ' кабинет '}
              </p>
              <p className={ cn('item-info') }>
                { mc.description + ' '}
              </p>
              <p className={ cn('item-info') } title={ mc.date + ' '}>
                {new Intl.DateTimeFormat('ru-RU', { 
                  month: 'long', 
                  day: '2-digit',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric'
                }).format(new Date(mc.date))}
              </p>
            </div>
            {renderEditButton(mc)}
          </div>
        )
      }) 
    }
    return (<p>мастер классов пока нет!</p>);
  }, [renderConference]);

  return (
    <div class={cn()}>
      <h2>Информация по мастер классах</h2>
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
        { renderConferenceValue }
      </section>
    </div>
  )
}
