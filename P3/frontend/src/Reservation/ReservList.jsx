import React, {useEffect, useState} from 'react';
import Reservation from "./Reservation"
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'material-icons/iconfont/material-icons.css';
import './reservation.css';
import HistoryReservation from "./HistoryReservation";
import axios from "axios";

const GetReservation = () => {
    const token = sessionStorage.getItem('access_token');
    const [reservationList, setReservationList] = useState([]);
    const [state, setState] = useState('both');
    const [completeList, setCompleteList] = useState([])
    const [resrver_state, setReserverState] = useState('n_complete')
    const [complete_state, setCompleteState] = useState('end')
    // infinite scroll
    const [page1, setPage1] = useState(1);
    const [page2, setPage2] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore1, setHasMore1] = useState(true);
    const [hasMore2, setHasMore2] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('http://127.0.0.1:8000/reservations/list/' + state + '/' + resrver_state + '/?page=1', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => response.json())
            .then((data) => {
                // console.log(state)
                // console.log(resrver_state)
                // console.log(data.results)
                console.log('第一次fetch')
                setHasMore1(data.count - page1 * 10 > 0)
                console.log(hasMore1)
                setReservationList(data.results);
            })
            .catch((error) => {
                console.error(error);
            });
        setLoading(false);
    }, [state, resrver_state]);

    const handleScroll = e => {
        const scrollThreshold = 1;
        const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + scrollThreshold;

        if (bottom && hasMore1) {
            setPage1(prevState => prevState + 1);
            console.log(page1)
        }
    };
    const fetchReplies = () => {
        if (page1 !== 1 && page1 !== null) {
            fetch('http://127.0.0.1:8000/reservations/list/' + state + '/n_complete/?page=' + page1, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(response => response.json()
            ).then((data) => {
                    setHasMore1(data.count - page1 * 10 > 0);
                    let count = data.count
                    if (count >= 10){
                        count = 10;
                    }

                    var newData = [];
                    console.log(data.count - page1 * 10 > 0)
                    console.log(count)
                    for (let i = 0; i < count; i++) {
                        // console.log(!reservationList.includes(data.results[i]))
                        if (!reservationList.includes(data.results[i]) && data.results[i] !== undefined) {
                            newData.push(data.results[i])
                        }
                    }
                    console.log(newData)

                    setReservationList(prevData => [...prevData, ...newData]
                    );
                }
            )
        }
    }

    const handleScroll2 = e => {
        const scrollThreshold = 1;
        const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + scrollThreshold;

        if (bottom && hasMore2) {
            setPage2(prevState => prevState + 1);
            console.log(page2)
        }
    };

    const fetchReplies2 = () => {
        if (page2 !== 1 && page2 !== null) {
            fetch('http://127.0.0.1:8000/reservations/list/' + state + '/' + complete_state + '/?page='+ page2, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(response => response.json()
            ).then((data) => {
                    setHasMore2(data.count - page1 * 10 > 0);
                    let count = data.count
                    if (count >= 10){
                        count = 10;
                    }

                    var newData = [];
                    console.log(data.count - page2 * 10 > 0)
                    console.log(count)
                    for (let i = 0; i < count; i++) {
                        // console.log(!reservationList.includes(data.results[i]))
                        if (!completeList.includes(data.results[i]) && data.results[i] !== undefined) {
                            newData.push(data.results[i])
                        }
                    }
                    console.log(newData)

                    setCompleteList(prevData => [...prevData, ...newData]
                    );
                }
            )
        }
    }

    useEffect(() => {
        if (page1 !== 1) {
            console.log(page1)
            fetchReplies();
        }
    }, [page1]);

    useEffect(() => {
        if (page2 !== 1){
            console.log(page2)
            fetchReplies2()
        }
    }, [page2])

    useEffect(() => {
        fetch('http://127.0.0.1:8000/reservations/list/' + state + '/' + complete_state + '/?page=1', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => response.json())
            .then((data) => {
                console.log(state)
                console.log(complete_state)
                // console.log(data.results)
                setCompleteList(data.results);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [state, complete_state])


    function handleChange(event) {
        setState(event.target.value);
        console.log(state)
    }

    function handleReserverChange(event) {
        setReserverState(event.target.value);
        console.log(resrver_state)
    }

    function handleCompleteChange(event) {
        setCompleteState(event.target.value);
        console.log(complete_state)
    }


    return <>
        <div className="switch-toggle switch-3 switch-candy pandding-top-60px">
            <input id="host" name="state-a" type="radio" value="reserver" checked={state === 'host'}
                   onChange={handleChange}/>
            <label htmlFor="on" onClick={() => setState('host')}>host</label>

            <input id="both" name="state-a" type="radio" value="reserver" checked={state === 'both'}
                   onChange={handleChange}/>
            <label htmlFor="na" className="disabled" onClick={() => setState('both')}>both</label>

            <input id="reserver" name="state-a" type="radio" value="off" checked={state === 'reserver'}
                   onChange={handleChange}/>
            <label htmlFor="off" onClick={() => setState('reserver')}>reserver</label>
        </div>
        <div className="switch-toggle1 switch-3 switch-candy pandding-top-120px">
            <input id="all1" name="state-b" type="radio" value="reserver-change"
                   checked={resrver_state === 'n_complete'}
                   onChange={handleReserverChange}/>
            <label htmlFor="on" onClick={() => setReserverState('n_complete')}>All</label>
            <input id="approved" name="state-b" type="radio" value="reserver-change"
                   checked={resrver_state === 'approved'}
                   onChange={handleReserverChange}/>
            <label htmlFor="off" onClick={() => setReserverState('approved')}>approved</label>
            <input id="pending" name="state-b" type="radio" value="reserver-change"
                   checked={resrver_state === 'pending'}
                   onChange={handleReserverChange}/>
            <label htmlFor="na" className="disabled" onClick={() => setReserverState('pending')}>pending</label>
            <input id="cancel_pending" name="state-b" type="radio" value="reserver-change"
                   checked={resrver_state === 'cancel_pending'}
                   onChange={handleReserverChange}/>
            <label htmlFor="off" onClick={() => setReserverState('cancel_pending')}>cancel_pending</label>
        </div>
        <div className="switch-toggle2 switch-3 switch-candy pandding-right-120px">
            <input id="all2" name="state-d" type="radio" value="complete" checked={complete_state === 'end'}
                   onChange={handleCompleteChange}/>
            <label htmlFor="on" onClick={() => setCompleteState('end')}>All</label>
            <input id="completed" name="state-d" type="radio" value="complete" checked={complete_state === 'completed'}
                   onChange={handleCompleteChange}/>
            <label htmlFor="on" onClick={() => setCompleteState('completed')}>completed</label>
            <input id="denied" name="state-d" type="radio" value="complete" checked={complete_state === 'denied'}
                   onChange={handleCompleteChange}/>
            <label htmlFor="off" onClick={() => setCompleteState('denied')}>denied</label>
            <input id="expired" name="state-d" type="radio" value="complete" checked={complete_state === 'expired'}
                   onChange={handleCompleteChange}/>
            <label htmlFor="off" onClick={() => setCompleteState('expired')}>expired</label>

            <input id="canceled" name="state-d" type="radio" value="complete" checked={complete_state === 'canceled'}
                   onChange={handleCompleteChange}/>
            <label htmlFor="off" onClick={() => setCompleteState('canceled')}>canceled</label>
            <input id="terminated" name="state-d" type="radio" value="complete"
                   checked={complete_state === 'terminated'}
                   onChange={handleCompleteChange}/>
            <label htmlFor="off" onClick={() => setCompleteState('terminated')}>terminated</label>
        </div>
        <div className="container-1">

            <div className='reserve_box'>
                <div className="headings d-flex justify-content-between align-items-center mb-3">
                    <h5>Reservation</h5>
                    <div className="buttons">
                    </div>
                </div>
                <div className="scroll_box" onScroll={handleScroll}>
                    <div className="col-box">

                        {reservationList.length === 0 ? (
                            <p>No reservations to display.</p>
                        ) : (
                            reservationList.map((reservation) => (
                                <div className="card p-3 margin_bot" key={reservation.id}>
                                    <Reservation data={reservation} state={state}/>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <div className='reserve_box'>
                <div className="headings d-flex justify-content-between align-items-center mb-3">
                    <h5>History</h5>
                    <div className="buttons">
                    </div>
                </div>
                <div className="scroll_box" onScroll={handleScroll2}>
                    <div className="col-box">
                        {completeList.length === 0 ? (
                            <p>No reservations to display.</p>
                        ) : (
                            completeList.map((reserve) => (

                                <div className="card p-3 margin_bot" key={reserve.id}>
                                    <HistoryReservation data={reserve}/>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

    </>;
}


export default GetReservation;