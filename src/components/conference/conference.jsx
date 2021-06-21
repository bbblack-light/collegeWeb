import React, { useState, useCallback, useMemo, useEffect }  from 'react';
import Modal from 'react-modal';
//используем реакт хуки useState, useCallback, useMemo
import { createCn } from 'bem-react-classname';
import { getUser} from '../../services/UserService';
import BackButton from '../back-button/backButton';
import { getAll, save, deleteById, isError} from '../../services/ConferenceService';
import { useStateWithCallbackLazy } from 'use-state-with-callback';

import './conference.css';

//инфа о конференс комнатах
export default function Conference(props) {
  const [user, setUser] = useState({role: ''}) //user изначально с пустой ролью. Функция setUser будет задавать пользователя и обновлять компонент после этого
  const [constructorHasRun, setConstructorHasRun] = useState(false); // флаг для понимания, отработал ли конструктор или нет
  const [conferenceInfo, setConference] = useStateWithCallbackLazy ([]); // конференции
  const [modalIsOpen,setModalIsOpen] = useState(false); // флаг говорящий, открыто ли окно добавления
  const [filter, setFilter] = useState('');// filter = '' - изначально пустой. функция setFilter будет задавать фильтр и обновлять компонент после этого
  const [teacher, setTeacher] = useState('');// teacher изначально пустой. Функция setTeacher будет задавать имя учителю и обновлять компонент после этого
  const [url, setUrl] = useState('');// url изначально пустой. Функция setUrl будет задавать ссылку и обновлять компонент после этого
  const [password, setPassword] = useState('');//password изначально пустой. Функция setPassword будет задавать пароль и обновлять компонент после этого
  const [id, setId] = useState(0);

  const handleTeacherChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с учителем
    setTeacher(e.target.value);
  }, [setTeacher]) //функция изменяется при изменении setTeacher

  const handleUrlChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с ссылкой
    setUrl(e.target.value);
  }, [setUrl]) //функция изменяется при изменении setUrl

  const handlePasswordChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с паролем для конференции
    setPassword(e.target.value);
  }, [setPassword]) //функция изменяется при изменении setPassword

  let cn = createCn('conference'); //генерируем класс .conference,  все последующие вызовы cn('class') будут возвращать .conference__class

  const setModalIsOpenToTrue =()=>{ // открывает окно добавления
    setModalIsOpen(true)
  }

  const setModalIsOpenToTrueWithId = (conf) => { // открывает окно добавления при изменении конференции, сохраняя конференцию в значения выше
    setModalIsOpenToTrue();
    setId(conf.id);
    setPassword(conf.password);
    setTeacher(conf.teacher);
    setUrl(conf.url);    
  }

  const setModalIsOpenToFalse =()=>{ // загрывает окно добавления
    setModalIsOpen(false)
    setId(0); // сбрасываем значения
    setPassword(''); // сбрасываем значения
    setTeacher(''); // сбрасываем значения
    setUrl(''); // сбрасываем значения
  }
  
  const saveConference =()=>{ // функция сохранения конференции
    let saveConf = {id: id, teacher: teacher, password: password, url: url }

    save(saveConf).then((data) => {// сохраняем
      if (!isError(data)) {
        let isFind = false;  // флаг о нахождении конференции в списках конференции
        setConference(conferenceInfo.map(conf=> {  // заменяем конференцию, если ее изменяли
          if (conf.id==data.id) {
            conf = data // заменяем конференцию, если ее нашли
            isFind=true; // если нашли конференцию в списках конференции, то флаг говорит "НАЙДЕНО"
          };
          return conf; 
        }));
        if (!isFind) { // если не нашли конференцию 
          conferenceInfo.push(data); // то заменяем ее
          setConference(conferenceInfo); // и обновляем список конференций
        }
      } 
      setModalIsOpenToFalse(); // загрываем окно добавления
      
    })
  }

  const deleteConf =(conf)=> {
    deleteById(conf.id).then((data) => { // отправляем запрос на удаление конференции
      if (!isError(data)) // если вернулась не ошибка
        setConference(conferenceInfo.filter(conference => conference.id!=conf.id)); // заменяем список конференций на список без удаленной конференции
    })
  }

  const handleFilterChange = useCallback((e) => { //создем функцию обработчик на изменения значений инпута с фильтром
    setFilter(e.target.value);
  }, [setFilter]) //функция изменяется при изменении setFilter

  const constructor = () => { // конструктор
    if (constructorHasRun) return; // если один раз сработал, то больше не вызывается
    getAll().then((data) => { // подгружаем с сервера все конференции
      if (!isError(data))   // если не ошибка
        setConference(data); // кладем данные в конференции после ассинхронно получения
    });
    
    getUser().then((data) => { // подгружаем пользователя
      if (!isError(data)) setUser(data); // если вернулась не ошибка, то присваиваем user
    })
    setConstructorHasRun(true); // говорим, что конструктор отработал
  };

  constructor(); //отрабатывает при открытии страницы

  const renderConference = useMemo(() => { //useMemo мемоизирует вычисления информации о конференс комнатах. Если пришли те же самые значения фунция вернет старое значение и не будет выполняться
    if (!filter) {
      return conferenceInfo; //если фильтр пуст, то возвращаем все
    }
    const lowerFilter = filter.toLowerCase(); //приводим значение фильтра в нижний регистр
    return conferenceInfo.filter(item => item.teacher.toLowerCase().includes(lowerFilter)) //ищем среди данных значения которые включают строку фильтра в именах
  }, [filter, conferenceInfo]); //useMemo изменяется при изменении filter и conferenceInfo
  
  let addButton = () => { // метод возвращает верстку кнопок добавления и модального окна с полями для ввода данных
    if (user.role=='ADMIN') { // если администратор
      return (
        <div>
          <button className={ cn('btn')} onClick={setModalIsOpenToTrue}>Добавить конференцию</button>
          
          <Modal isOpen={modalIsOpen} className={ cn('modal')}>
            <button onClick={setModalIsOpenToFalse}>x</button>
            <input
              type='text'
              placeholder='Имя преподавателя'
              className={ cn('input') }
              value={teacher}
              onChange={handleTeacherChange}
            />
            <input
              type='text'
              placeholder='Ссылка на конференцию'
              className={ cn('input') }
              value={url}
              onChange={handleUrlChange}
            />
            <input
              type='text'
              placeholder='Пароль конференции'
              className={ cn('input') }
              value={password}
              onChange={handlePasswordChange}
            />
            <button className={ cn('btn')} onClick={saveConference}>Сохранить</button>
          </Modal>
        </div>
      );
    }
    return;
  }

  const renderEditButton = (conf) => { // метод возвращает кнопки изменения, удаления конференци
    if (user.role == 'ADMIN'){ // если администратор
      return (
      <div className={cn('item')}>
        <button  className={ cn('item_btn')} onClick={() => setModalIsOpenToTrueWithId(conf)}>Изменить</button>
        <button  className={ cn('item_btn')} onClick={() => deleteConf(conf)}>Удалить</button>
      </div>)
    }
  }
  const renderConferenceValue = useMemo(() => { // метод возвращает верстку информации о конференциях
    if (conferenceInfo!==undefined && conferenceInfo.length!=0) {
      return renderConference.map((conf) => {
        return(
          <div className={ cn('item-line') }>
            <div className={ cn('item') }>
              <span className={ cn('item-name') }>
                { conf.teacher }
              </span>
              <span className={ cn('item-info') }>
                { conf.password + ' '}
              </span>
              <a href={conf.url} tagret='blank'>Ссылка</a>
            </div>
            {renderEditButton(conf)}
          </div>
        )
      }) 
    }
    return (<p>Конференций пока нет!</p>);
  }, [renderConference]);

  return (
    <div class={cn()}>
      <h2>Информация по конференс комнатам</h2>
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
