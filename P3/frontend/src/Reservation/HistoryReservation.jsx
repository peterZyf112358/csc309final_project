import {useEffect, useState} from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import {Link} from "react-router-dom";

const HistoryReservation = (props) => {
    const token = sessionStorage.getItem('access_token');
    const user_id = sessionStorage.getItem('user_id').toString()
    const {id, start_day, end_day, status, price, host, property, reserver} = props.data;
    const [propertyAddress, setPropertyAddress] = useState([]);
    const [propertyImage, setPropertyImage] = useState();
    const [action, setAction] = useState()
    const [reservationAction, setReservationAction] = useState()

    useEffect(() => {
        fetch('http://127.0.0.1:8000/property/details/' + property + '/', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => response.json())
            .then((data) => {
                console.log(data.image_cover)
                setPropertyAddress(data.address);
                setPropertyImage(data.image_cover)
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    function go_user(){
        window.location.href = '/profile/'+ reserver + '/'
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
                <a className="font-weight white" onClick={go_host}>{propertyAddress}</a>
            </span>
            <div className="user3 d-flex flex-row align-items-center gap_reservation3">
                <span><small className="font-weight-bold text-primary">status</small>

                    {status === "terminated" && <div className="font-weight problems">Terminated</div>}
                    {status === "expired" && <div className="font-weight expired">Expired</div>}
                    {status === "denied" && <div className="font-weight problems">Denied</div>}
                    {status === "canceled" && <div className="font-weight problems">Canceled</div>}

                    {status === "completed" && <div className="font-weight approved">Completed</div>}
                    {status === "pending" && <div className="font-weight pending">Pending</div>}
                    {status === "cancel-pending" && <div className="font-weight pending">Cancel-pending</div>}
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
                    {((status === 'terminated' || status === 'denied' || status === 'expired' || status === 'canceled') && user_id === host.toString()) && (
                        <i className="fa fa-thumbs-o-up reply">
                            <button onClick={go_user}>ViewUser</button>
                            {/*<a href="#" data-toggle="modal" data-target="#Modalcancel">*/}
                            {/*    <small className="ml-1">terminated</small>*/}
                            {/*</a>*/}
                        </i>
                    )}
                    {(status === 'completed' && user_id === host.toString()) && (
                        <i className="fa fa-thumbs-o-up reply">
                            <button onClick={go_user}>Comments</button>
                            {/*<a href="#" data-toggle="modal" data-target="#Modalcancel">*/}
                            {/*    <small className="ml-1">terminated</small>*/}
                            {/*</a>*/}
                        </i>
                    )}
                    {(status === 'completed' && user_id === reserver.toString()) && (
                        <i className="fa fa-thumbs-o-up reply">
                            <button onClick={go_host}>Comments</button>
                            {/*<a href="#" data-toggle="modal" data-target="#Modalcancel">*/}
                            {/*    <small className="ml-1">terminated</small>*/}
                            {/*</a>*/}
                        </i>
                    )}
                    {(status === 'terminated' && user_id === reserver.toString()) && (
                        <i className="fa fa-question-circle reply">
                            <button onClick={go_host}>Ask Question</button>
                            {/*<a href="#" data-toggle="modal" data-target="#Modalcancel">*/}
                            {/*    <small className="ml-1">terminated</small>*/}
                            {/*</a>*/}
                        </i>
                    )}
                </div>
            </div>
        </div>
        {/*<Modal show={showPopup} onHide={hide}>*/}
        {/*    <Modal.Header closeButton>*/}
        {/*        <Modal.Title>Change Password</Modal.Title>*/}
        {/*    </Modal.Header>*/}

        {/*    <Modal.Body>*/}
        {/*        <p>you are going to <b className="action">{action}</b> the reservation. Please consider seriously </p>*/}
        {/*    </Modal.Body>*/}
        {/*    <Modal.Footer>*/}

        {/*        <Button onClick={update} variant="primary" type='submit'>*/}
        {/*            {action}*/}
        {/*        </Button>*/}
        {/*    </Modal.Footer>*/}
        {/*</Modal>*/}
    </>
}
export default HistoryReservation