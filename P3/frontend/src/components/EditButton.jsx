import { useState, useEffect } from 'react';
function editButton(){
  
  return(
    <div className='edit-box'>
      <button className="edit-button" data-toggle="modal" data-target="#img-edit"><img className="image" src="edit.png" title="edit-icon"/></button>
    </div>
  );
}

export default editButton;