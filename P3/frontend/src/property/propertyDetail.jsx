import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Locbar from '../navbar';
import Footer from '../footer';
import { Toast } from 'antd-mobile';
import { getPropertyDetail, getPropertyComments, getOwnerInfo, deleteProperty } from '../api';
import Rating from '../components/Rating';
import ImageSlider from '../components/ImageSlider';
import Button from 'react-bootstrap/Button';
import AmenitiesTable from '../components/ShowAmenities';
import bedroom from '../assets/bed.jpg';
import bathroom from '../assets/shower.jpg';
import Modal from 'react-bootstrap/Modal';
import edit from '../assets/edit.png';
import ReserveForm from '../components/ReserveForm';
import PropertyComments from '../components/PropertyComments';
import './property.css';

function PropertyDetail(){
  const { id } = useParams();
  const BASE_URL = 'http://127.0.0.1:8000';
  const [property, setProperty] = useState(null);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [priceShow, setpriceShow] = useState(false);
  const [deleteShow, setDeleteShow] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [commentRating, setCommentRating] = useState(0);
  const [replyContent, setReplyContent] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [replyError, setReplyError] = useState('');

  const navigate = useNavigate();

  const handlepriceClose = () => setpriceShow(false);
  const handlepriceShow = () => setpriceShow(true);

  const handleDeleteClose = () => setDeleteShow(false);
  const handleDeleteShow = () => setDeleteShow(true);

  useEffect(() => {
    Toast.show({ icon: 'loading', content: 'loading...' });
    getPropertyDetail( id ).then((data) => {
        Toast.clear();
        if (data) {
          setProperty(data);
          console.log(data);
          if(sessionStorage.getItem('user_id')){
            setIsOwner(Number(data.owner) === Number(sessionStorage.getItem('user_id')));
          }
          getOwnerInfo(data.owner).then((data) => {
            setOwnerInfo(data);
          })
        } else {
          Toast.show({content: 'No property found' });
        }
    });
    
  }, [id]);

  const postPropertyComments = () => {
    if (commentContent === ""){
      setErrorMessage("Your comment can not be empty.");
    } else if (commentRating === 0){
      setErrorMessage("You must select a rating.")
    } else{
      setErrorMessage("");
      fetch(`${BASE_URL}/comments/property/${id}/comments/`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('access_token'),
      },
      body: JSON.stringify({
        content: commentContent,
        rating: commentRating,
      })
    })
    .then(response => {
      if (!response.ok) {
        throw response;
      } else {
        alert("posted!");
        window.location.reload();
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error(error);
      if (error.status === 400) {
        return error.json().then((data) => {
          setErrorMessage(`Error ${error.status}: ${data.detail[0]}`);
        });
      } else {
        setErrorMessage(`Error: ${error.status}`);
      }
    });}
};

  const postPropertyReplys = (revieverId, commentId, content) => {
    if(replyContent === ""){
      setReplyError("Your reply cannot be empty");
    }else{
      setReplyError("");
      return fetch(`${BASE_URL}/comments/property/${commentId}/reply/`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem('access_token'),
        },
        body: JSON.stringify({
          content: replyContent,
        })
      })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error(error);
        if (error.status === 400) {
          return error.json().then((data) => {
            setReplyError(`Error ${error.status}: ${data.detail[0]}`);
          });
        } else {
          setReplyError(`Error: ${error.status}`);
        }
      });}
  }

  function handleEdit(){
    navigate(`/property/update/${id}`, {replace: true})
  }

  function handleDelete(){
    deleteProperty(id)
    alert("Delete success!")
    navigate('/', {replace: true})
  }

  if (!property) {
    return <div>
    <Locbar/>
    <p style={{fontSize: 20, color: "black", paddingTop: "10vh", paddingLeft: "20px"}}>No property found.</p>
    <Footer/>
    </div>; 
  }
  return(
    <div>
    <Locbar/>
    <main className='main-property'>
      <div className="div-property">
        <div className="main-container">
          <div className="location-container">
            <div style={{display: "flex", flexDirection: "horizontal", justifyContent: "space-between"}}> 
              <h2 className="address1" >
                {property.address}
              </h2>
              <div className='logo-container'>
                {isOwner ? <div className="edit-box">
                  <button className="edit-button" onClick={handleEdit}><img className="image" src={edit} title="edit-icon"/></button>
                  <img className='logo' style={{transform: "scale(0.5)"}} src="https://www.svgrepo.com/show/21045/delete-button.svg" alt="del" onClick={handleDeleteShow}/>
                </div> : <div/>}
                <Modal show={deleteShow} onHide={handleDeleteClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>Delete Property</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <p className='address1' style={{color: "red", fontSize: "large"}}>Are you sure to delete this property?</p>
                    <p className='address2'>You can not undo this action.</p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant='primary' onClick={handleDelete}>
                      Delete
                    </Button>
                    <Button variant="secondary" onClick={handleDeleteClose}>
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
            <p className="address2">
              Condo - Toronto, ON
            </p>
            <div className="logo-container">
              <img className="logo" src={bedroom} alt="bedroom" style={{transform: "scale(1.2)"}}/>
              <p className="logo-text">x{property.num_bed}</p>
              <img className="logo" src={bathroom} alt="washroom" style={{transform: "scale(0.7)"}}/>
              <p className="logo-text">x{property.num_bath}</p>
              <p className="logo-text">Rating: {property.rating}/5 </p>
            </div>
          </div>
          <div className="big-container">
            <h2 className="address1">Pictures</h2>
            <div className="slide-container">
              {property.images.length > 0 ? <ImageSlider images={property.images}> </ImageSlider> 
              : <div><p>No image available</p></div>
              }
            </div>
          </div>
          <div className="big-container">
            <h2 className="address1">Facts</h2>
            <AmenitiesTable amenities={property.amenities} />
          </div>
          <div className="big-container">
            <h2 className="address1">Description:</h2>
            <div className="description-container">
              <p className="description-text">{property.description}</p>
            </div>
          </div>
          <div className="big-container">
            <h2 className="address1">Comments</h2>
            <div className="col-md-8">
            <div className="card p-3" style={{ display: "flex", alignItems: "flex-start" }}>
              <h4 className="address">Write Comments: </h4>
              <Rating value={commentRating} onChange={(value) => setCommentRating(value)}/>
              <textarea style={{ width: "100%", minHeight: "100px" }} placeholder="Write your comment here..." 
              value={commentContent} onChange={(event) => setCommentContent(event.target.value)}></textarea>
                <div className="reply">
                  <button className="post" onClick={postPropertyComments}>Post</button>
                  </div>
                  {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                  <div>
                </div>
            </div>
            <div className="card p-3">
              <PropertyComments data={property.id} user={sessionStorage.getItem('user_id')}/>
            </div>
            </div>
          </div>
        </div>
      
        <div className="side-container">
          <div className="seller-container">
            <h2 className="address1">Seller</h2>
            {ownerInfo && ownerInfo.avatar ? <img className="seller-avatar" src={ownerInfo.avatar} alt="head" onClick={() => {navigate(`/profile/${ownerInfo.id}`)}}/> :
            <img className="seller-avatar" src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg" alt="head"/>}
            {ownerInfo && ownerInfo.first_name && ownerInfo.last_name ?
            <h3 className="seller-name">{ownerInfo.first_name} {ownerInfo.last_name}</h3> :
            <h3 className="seller-name">--</h3>
            }
            <div className="seller-info">
              <p className="seller-info-text-title">Email:</p>
              {ownerInfo && ownerInfo.email ?
              <p className="seller-info-text">{ownerInfo.email}</p>
              : <p className="seller-info-text"> -- </p>
              }
            </div>
            <div className="seller-info">
              <p className="seller-info-text-title">Phone:</p>
              {ownerInfo && ownerInfo.phone ?
              <p className="seller-info-text">{ownerInfo.phone}</p>
              : <p className="seller-info-text"> -- </p>
              }
            </div>
            <div className="seller-info">
              <p className="seller-info-text-title">Rating:</p>
              {ownerInfo && ownerInfo.rating ?
              <p className="seller-info-text">{ownerInfo.rating}</p>
              : <p className="seller-info-text"> -- </p>
              }
            </div>
          </div>
          <div className="pay-container">
            <h3 style={{ overflowWrap: "break-word" }}>Price/Night: ${property.price}</h3>
            <button className="button" onClick={handlepriceShow}>Place Order</button> 
            <Modal show={priceShow} onHide={handlepriceClose}>
              <Modal.Header closeButton>
                <Modal.Title>Make Reservation</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <ReserveForm id={property.id} price={property.price}/>
              </Modal.Body>
              
            </Modal>
          </div>
        </div>
      </div>
    </main>
    <br></br>
    <br></br>
    <Footer/>
    </div>
    )
}

export default PropertyDetail;