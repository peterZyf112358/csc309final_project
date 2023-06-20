import {useEffect, useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const Reservation = (props) => {
    const token = sessionStorage.getItem('access_token');
    const user_id = sessionStorage.getItem('user_id').toString();

    const {id, start_day, end_day, status, price, host, property, reserver} = props.data;
    const [propertyAddress, setPropertyAddress] = useState([]);
    const [propertyImage, setPropertyImage] = useState();
    const [showPopup, setShowPopup] = useState(false);
    const [action, setAction] = useState()

    useEffect(() => {
        fetch('http://127.0.0.1:8000/property/details/' + property + '/', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => response.json())
            .then((data) => {
                setPropertyAddress(data.address);
                setPropertyImage(data.image_cover)
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    function show1() {

        setAction('Terminated')
        console.log(action)
        console.log(property)
        setShowPopup(true);
    }

    function show2() {
        setAction('Approved')
        console.log(action)
        console.log(property)
        setShowPopup(true);
    }

    function show3() {
        setAction('Cancel')
        console.log(action)
        console.log(property)
        setShowPopup(true);
    }

    function show4() {
        setAction('Decline')
        console.log(action)
        console.log(property)
        setShowPopup(true);
    }

    function show5() {
        setAction('Cancel-Approve')
        console.log(action)
        console.log(property)
        setShowPopup(true);
    }

    function show6() {
        setAction('Cancel-Reserver')
        console.log(action)
        console.log(property)
        setShowPopup(true);
    }

    function hide() {
        setShowPopup(false);
    }

    function update() {
        if (action === 'Terminated') {
            fetch(`http://127.0.0.1:8000/reservations/terminate/${id}/`, {
                method: 'Put',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(response => {
                // // eslint-disable-next-line no-restricted-globals
                // location.href = `http://localhost:3000/reservation?${state}`;
                //
                // const searchParams = new URLSearchParams(window.location.search);

                // eslint-disable-next-line no-restricted-globals
                location.reload()
            })
        } else if (action === 'Approved') {
            let formData = new FormData();
            formData.append("action", "approve");
            fetch(`http://127.0.0.1:8000/reservations/pendingAction/${id}/`, {
                method: 'Put',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            }).then(response => {
                // eslint-disable-next-line no-restricted-globals
                location.reload(status)
            })
        } else if (action === 'Cancel') {
            let formData = new FormData();
              formData.append("action", "deny");
            fetch(`http://127.0.0.1:8000/reservations/pendingAction/${id}/`, {
                method: 'Put',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            }).then(response => {
                // eslint-disable-next-line no-restricted-globals
                location.reload()
            })
        } else if (action === 'Decline') {
            let formData = new FormData();
              formData.append("action", "deny");
            fetch(`http://127.0.0.1:8000/reservations/cancelAction/${id}/`, {
                method: 'Put',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            })
                .then(response => {
                // eslint-disable-next-line no-restricted-globals
                location.reload()
            })
        } else if (action === 'Cancel-Approve') {
            let formData = new FormData();
            formData.append("action", "approve");
            fetch(`http://127.0.0.1:8000/reservations/cancelAction/${id}/`, {
                method: 'Put',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            })
                .then(response => {
                // eslint-disable-next-line no-restricted-globals
                location.reload()
            })
        } else if (action === 'Cancel-Reserver') {
            fetch(`http://127.0.0.1:8000/reservations/cancel/${id}/`, {
                method: 'Put',
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }).then(response => {
                // eslint-disable-next-line no-restricted-globals
                location.reload()
            })
        }
    }
        function go_host(){
        window.location.href = '/property/details/'+ property + '/'
    }

    return <>
        <div className="user2 d-flex flex-row align-items-center card-info">



            <a className="gap_reservation" onClick={go_host}>
                <img src={'http://127.0.0.1:8000'+propertyImage} width="70" height="70" className="user-img rounded-circle mr-2"/>
            </a>

            <span className="gap_reservation_1">
                <a onClick={go_host} className="font-weight white">{propertyAddress}</a>
            </span>
            <div className="user3 d-flex flex-row align-items-center gap_reservation3">
                <span><small className="font-weight-bold text-primary">status</small>
                    {status === "terminated" && <div className="font-weight problems">Terminated</div>}
                    {status === "expired" && <div className="font-weight expired">Expired</div>}
                    {status === "denied" && <div className="font-weight problems">Denied</div>}
                    {status === "canceled" && <div className="font-weight problems">Canceled</div>}

                    {status === "approved" && <div className="font-weight approved">Approved</div>}
                    {status === "pending" && <div className="font-weight pending">Pending</div>}
                    {status === "cancel_pending" && <div className="font-weight pending">Cancel-pending</div>}

                </span>
            </div>
            <div className="user4 d-flex flex-row align-items-center gap_reservation4">
                <span className="address_span"><small className="font-weight-bold text-primary">Dates</small>
                    <div className="font-weight white">{start_day}</div>
                    <div className="font-weight white">{end_day}</div>
                    <div><span className="font-weight-bold text-primary">price:</span>
                        <span className="font-weight white">${price}</span></div>
                </span>
            </div>

        </div>

        <div>
            <div>
                <div>
                    {/*{console.log(user_id) + console.log(host) + console.log(reserver)}*/}
                    {(status === 'approved' && user_id === host.toString()) && (
                        <i className="fa fa-times reply">
                            <button onClick={show1}>terminated</button>
                            {/*<a href="#" data-toggle="modal" data-target="#Modalcancel">*/}
                            {/*    <small className="ml-1">terminated</small>*/}
                            {/*</a>*/}
                        </i>

                    )}

                    {(status === 'pending' && user_id === host.toString()) && (
                        <div>
                            <i className="fa fa-check reply">
                                <button onClick={show2}>Approved</button>
                                {/*<a href="#" data-toggle="modal" data-target="#Modalcancel">*/}
                                {/*    <small className="ml-1">Approved</small>*/}
                                {/*</a>*/}
                            </i>
                            <i className="fa fa-times reply">
                                <button onClick={show3}>Cancel</button>
                                {/*<a href="#" data-toggle="modal" data-target="#Modalcancel">*/}
                                {/*    <small className="ml-1">Cancel</small>*/}
                                {/*</a>*/}
                            </i>
                        </div>

                    )}

                    {(status === 'cancel_pending' && user_id === host.toString()) && (
                        <div>
                            <i className="fa fa-times reply">
                                <button onClick={show4}>Decline</button>
                            </i>
                            <i className="fa fa-check reply">
                                <button onClick={show5}>Cancel-Approve</button>
                                {/*<a href="#" data-toggle="modal" data-target="#Modalcancel">*/}
                                {/*    <small className="ml-1">Cancel-Approve</small>*/}
                                {/*</a>*/}
                            </i>
                        </div>
                    )}

                    {(status === 'approved' && user_id === reserver.toString()) && (
                        <div>
                            <i className="fa fa-times reply">
                                <button onClick={show6}>Cancel2</button>
                            </i>
                        </div>
                    )}
                    {(status === 'pending' && user_id === reserver.toString()) && (
                        <div>
                            <i className="fa fa-times reply">
                                <button onClick={show6}>Cancel3</button>
                            </i>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <Modal show={showPopup} onHide={hide}>
            <Modal.Header closeButton>
                <Modal.Title>Change Password</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>you are going to <b className="action">{action}</b> the reservation. Please consider seriously </p>
            </Modal.Body>
            <Modal.Footer>

                <Button onClick={update} variant="primary" type='submit'>
                    {action}
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}
export default Reservation