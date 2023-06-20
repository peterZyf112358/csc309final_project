import "../account.css";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { apiUrl} from '../constants';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function UserComments(props){
    const userID = props.data
    const [commentData, setCommentData] = useState([]);
    const [commentPage, setCommentPage] = useState(null);
    const [commentNext, setCommentNext] = useState(true);
    const [totalComment, setTotalComment] = useState(0);
    const [showReply, setShowReply] = useState(false);
    const [replyData, setReplyData] = useState([]);
    const [replyParam, setReplyParam] = useState({"page" : null, "comment" : null}); 
    const [replyNext, setReplyNext] = useState(true);
    const [reply, setReply] = useState("");
    const [replyError, setReplyError] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [refreshReply, setRefreshReply] = useState(false);
    const [showComment, setShowComment] = useState(false);
    const [ratingError, setRatingError] = useState("");
    const [commentError, setCommentError] = useState("");
    const [rating, setRating] = useState(null);
    const [content, setContent] = useState("");
    const [refreshComment, setRefreshComment] = useState(false);

    useEffect(() => {
      if(refreshComment){
        setCommentPage(1);
        fetch(`${apiUrl}comments/user/${userID}/?page=1`, {
          method : "GET",
          headers : {
            Authorization : "Bearer " + sessionStorage.getItem("access_token"),
          },
        })
          .then(response => response.json())
          .then(data => {
            var newData = [];
            let count = data.count;
            if(count >= 10){
              count = 10;
            }
            setTotalComment(data.count);
            for(let i = 0; i < count; i++){
              if(!commentData.includes(data.results[i])){
                newData.push(data.results[i]);
              }
            }
            setCommentData(newData);
            if(data.next === null){
              setCommentNext(false);
            }else{
              setCommentNext(true);
            }
            setRefreshComment(false);
          });
      }
    }, [refreshComment]);

    function makeComment(){
      if(content === ""){
        setCommentError("You must enter some content in your comment");
      }else if(rating === null){
        setRatingError("You must give a rating associated with this comment");
      }else{
        setCommentError("")
        setRatingError("");
            let formData = new FormData();
            formData.append("content", content);
            formData.append("rating", rating);
            fetch(`${apiUrl}comments/user/${userID}/comments/`, {
                method : "POST",
                headers : {
                  Authorization : "Bearer " + sessionStorage.getItem("access_token"),
                },
                body : formData,
              })
              .then((response) => {
                if(response.ok){
                  return response.json();
                }else{
                  return {error : "You cannot comment on this user"}
                }
              })
                .then(data => {
                    if(data.error){
                        setCommentError(data.error);
                    }else{
                        setCommentError("");
                        setRefreshComment(true);
                        setContent("");
                        setRating(null);
                        hideCommentModal();
                    }
                });
      }
    }

    function changeContent(e){
      if(e.target.value === ""){
        setCommentError("You must enter some content in your comment");
      }else{
        setCommentError("");
        setContent(e.target.value);
      }
  }

  function changeRating(e){
    if(e.target.value === ""){
      setRatingError("You must give a rating associated with this comment");
    }else{
      setRatingError("");
      setRating(parseInt(e.target.value));
    }
}

    function showCommentModal(){
      setShowComment(true);
    }

    function hideCommentModal(){
      setShowComment(false);
      setRatingError("");
      setCommentError("");
      setRating(null);
      setContent("")
    }

    useEffect(() => {
        fetch(`${apiUrl}accounts/getUser/${userID}/`, {
            method : "GET",
            headers : {
              Authorization : "Bearer " + sessionStorage.getItem("access_token"),
            },
          })
          .then(response => response.json())
          .then(json => {
            setAvatar(json.avatar);
            setCommentPage(1);
          });
            fetch(`${apiUrl}comments/user/${userID}/?page=1`, {
              method : "GET",
              headers : {
                Authorization : "Bearer " + sessionStorage.getItem("access_token"),
              },
            })
              .then(response => response.json())
              .then(data => {
                var newData = [];
                let count = data.count;
              setTotalComment(count);
              if(count >= 10){
                count = 10;
              }
                for(let i = 0; i < count; i++){
                  if(!commentData.includes(data.results[i])){
                    newData.push(data.results[i]);
                  }
                }
                setCommentData(newData);
                if(data.next === null){
                  setCommentNext(false);
                }else{
                  setCommentNext(true);
                }
              });
    }, [userID]);

    function changeReply(e){
        setReply(e.target.value);
    }

    function sendReply(){
        if(reply === ""){
            setReplyError("Your reply cannot be empty")
        }else{
            setReplyError("")
            let formData = new FormData();
            formData.append("content", reply)
            fetch(`${apiUrl}comments/user/${replyParam.comment.id}/reply/`, {
                method : "POST",
                headers : {
                  Authorization : "Bearer " + sessionStorage.getItem("access_token"),
                },
                body : formData,
              })
              .then((response) => {
                if(response.ok){
                  return response.json();
                }else{
                  return {error : "You cannot reply to this comment"}
                }
              })
                .then(data => {
                    if(data.error){
                        setReplyError(data.error);
                    }else{
                        setReplyError("");
                        setRefreshReply(true);
                        setReply("");
                    }
                });
        }
    }

    useEffect(() => {
      if(refreshReply){
        setReplyParam((prevState) => ({...prevState, page : 1}));
        fetch(`${apiUrl}comments/reply/${replyParam.comment.id}/?page=1`, {
          method : "GET",
          headers : {
            Authorization : "Bearer " + sessionStorage.getItem("access_token"),
          },
        })
          .then(response => response.json())
          .then(data => {
            var newData = [];
            let count = data.count;
            if(count >= 10){
              count = 10;
            }
            for(let i = 0; i < count; i++){
              if(!replyData.includes(data.results[i])){
                newData.push(data.results[i]);
              }
            }
            setReplyData(newData);
            if(data.next === null){
              setReplyNext(false);
            }else{
              setReplyNext(true);
            }
            setRefreshReply(false);
          });
      }
    }, [refreshReply]);

    useEffect(() => {
        fetchReplies();
    }, [replyParam]);

    const handleReplyScroll = e => {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom && replyNext) {
            setReplyParam((prevState) => ({ ...prevState, page: prevState.page + 1 }));
        }
      };

    function showReplyModal(item){
        setRefreshReply(true);
        setShowReply(true);
        setReplyParam({"page" : 1, "comment" : item});
    }

    function hideReplyModal(){
        setRefreshReply(false);
        setShowReply(false);
        setReplyParam({"page" : null, "comment" : null});
        setReplyData([])
        setReplyError("")
    }

    const fetchReplies = () => {
        if(replyParam.page !== null && replyParam.page !== 1){
        fetch(`${apiUrl}comments/reply/${replyParam.comment.id}/?page=${replyParam.page}`, {
          method : "GET",
          headers : {
            Authorization : "Bearer " + sessionStorage.getItem("access_token"),
          },
        })
          .then(response => response.json())
          .then(data => {
            var newData = [];
            let count = data.count;
            if(count >= replyParam.page * 10){
              count = 10;
            }else{
              count = count % 10;
            }
            for(let i = 0; i < count; i++){
              if(!replyData.includes(data.results[i])){
                newData.push(data.results[i]);
              }
            }
            setReplyData(prevData => [...prevData, ...newData]);
            if(data.next === null){
              setReplyNext(false);
            }else{
              setReplyNext(true);
            }
          });
        }
      };

    useEffect(() => {
        fetchComments();
      }, [commentPage]);

    const fetchComments = () => {
        if(commentPage !== null && commentPage !== 1){
        fetch(`${apiUrl}comments/user/${userID}/?page=${commentPage}`, {
          method : "GET",
          headers : {
            Authorization : "Bearer " + sessionStorage.getItem("access_token"),
          },
        })
          .then(response => response.json())
          .then(data => {
            var newData = [];
            let count = data.count;
            setTotalComment(count);

            if(count >= commentPage * 10){
              count = 10;
            }else{
              count = count % 10;
            }
            for(let i = 0; i < count; i++){
              if(!commentData.includes(data.results[i])){
                newData.push(data.results[i]);
              }
            }
            setCommentData(prevData => [...prevData, ...newData]);
            if(data.next === null){
              setCommentNext(false);
            }else{
              setCommentNext(true);
            }
          });
        }
      };

      const handleScroll = e => {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom && commentNext) {
          setCommentPage(prevPage => prevPage + 1);
        }
      };

    return <>
        <div className="container-profile border-right border-left ">
            <div className="headings d-flex justify-content-between align-items-center mb-3">
                <h5>Comments({totalComment})</h5><Button variant="primary" style={{width : "25%", height : "25px", fontSize : "11px", backgroundColor : "#013a6f", color : "white", marginRight : "10px", padding : "0px", border : "1px solid white", fontSize : "11px"}} onClick={showCommentModal}>Comment</Button>
            </div>
            <div className="scroll_box_profile" onScroll={handleScroll}>
                <div className="col-md-8">
                    {commentData.map(item => (
                                    <div className="card p-3" key={item.id}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="user2-profile d-flex flex-row align-items-center">
                                            <Link to={`/profile/${item.sender_id}`}><img src={item.sender.avatar} width="70" height="70"
                                                className="user-img rounded-circle mr-2"></img></Link>
                                            <span><small className="font-weight-bold">{item.content}</small></span>
                                        </div>
                                    </div>
                                    <div className="action d-flex justify-content-between mt-2 align-items-center">
                                        <div className="reply">
                                            <a href="#" style={{ textDecoration: 'none' }} onClick={() => showReplyModal(item)}><small>view replies</small></a>
                                        </div>
                                        <div className="reply-2">
                                           <small>Rating : {item.rating}</small>
                                        </div>
                                    </div>
                                </div>
                    ))}
                </div>
            </div>
        </div>

        <Modal show={showReply} onHide={hideReplyModal}>
        <Modal.Header closeButton>
          <Modal.Title>Replies</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div className="scroll_box_profile"  onScroll = {handleReplyScroll}>
                <div className="col-md-8">
                {replyParam.comment === null ? <></> : 
                <div className="card p-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="user2-profile d-flex flex-row align-items-center">
                                            <Link to={`/profile/${replyParam.comment.sender_id}`}><img src={replyParam.comment.sender.avatar} width="70" height="70"
                                                className="user-img rounded-circle mr-2"></img></Link>
                                            <span><small className="font-weight-bold">{replyParam.comment.content}</small></span>
                                        </div>
                                    </div>
                                    <div className="action d-flex justify-content-between mt-2 align-items-center">
                                        <div className="reply-2">
                                           <small>Rating : {replyParam.comment.rating}</small>
                                        </div>
                                    </div>
                                </div>
                }   
        {replyData.map(item => (
                                    <div className="card p-3" key={item.id}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="user2-profile d-flex flex-row align-items-center">
                                            <Link to={`/profile/${item.sender_id}`}>{parseInt(item.sender_id) === parseInt(userID) ? <img src={avatar} width="70" height="70"
                                                className="user-img rounded-circle mr-2"></img> : <img src={replyParam.comment.sender.avatar} width="70" height="70"
                                                className="user-img rounded-circle mr-2"></img>}</Link>
                                            <span><small className="font-weight-bold">{item.content}</small></span>
                                        </div>
                                    </div>
                                </div>
                    ))}
                    <div className="card p-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="user2-profile d-flex flex-row align-items-center">
                                        <textarea
                                        rows="6"
                                        name="message"
                                        id="message"
                                        style={{width : "100%"}}
                                        onChange={changeReply}
                                        value={reply}
                                        ></textarea>
                                        </div>
                                    </div>
                                    <div style={{display : "flex", justifyContent : "center", alignItems : "center"}}>
                                    <p className="error">{replyError}</p>
                                    </div>
                    </div>
                    </div>
                    </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideReplyModal}>
            Close
          </Button>
          <Button variant="primary" onClick={sendReply}>
            Reply
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showComment} onHide={hideCommentModal}>
        <Modal.Header closeButton>
          <Modal.Title>New Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div className="scroll_box_profile">
                <div className="col-md-8">
                    <div className="card p-3">
                    <p style={{marginTop : "1rem", marginBottom : "0"}}>Rating:</p>
                    <select onChange={changeRating}>
                    <option value="" disabled selected>Select a rating</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    </select>
                    <p className="error">{ratingError}</p>
                    <p style={{marginTop : "1rem", marginBottom : "0"}}>Content:</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="user2-profile d-flex flex-row align-items-center">
                                        <textarea
                                        rows="6"
                                        name="message"
                                        id="message"
                                        style={{width : "100%"}}
                                        onChange={changeContent}
                                        ></textarea>
                                        </div>
                                    </div>
                                    <div style={{display : "flex", justifyContent : "center", alignItems : "center"}}>
                                    <p className="error">{commentError}</p>
                                    </div>
                    </div>
                    </div>
                    </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideCommentModal}>
            Close
          </Button>
          <Button variant="primary" onClick={makeComment}>
            Comment
          </Button>
        </Modal.Footer>
      </Modal>
    </>
}

export default UserComments