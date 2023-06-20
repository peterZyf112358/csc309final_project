import { getAvailable } from '../api/index';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import './Calendar.css';
import Button from 'react-bootstrap/Button';

function ReserveForm(props) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const token = sessionStorage.getItem('access_token');
  const id = useParams();
  useEffect(() => {
    getAvailable(id.id)
      .then((data) => {
        if (data){
          console.log(data);
          const updatedDates = data.time.map((date) => {
            if (date.end < date.start) {
              // Swap start and end times using destructuring assignment
              [date.start, date.end] = [date.end, date.start];
            }
            return date;
          });
          setAvailableDates(data.time);
        }
      })
      .catch((error) => {
        console.error('Error fetching available dates:', error);
        setErrorMessage('Error: Failed to fetch available dates. Please try again later.');
      });
  }, []);


  function handleSubmit(event) {
    event.preventDefault();

    const start = new Date(startTime);
    const end = new Date(endTime);

    // check if start and end times are valid
    if (start > end) {
      setErrorMessage('Error: Invalid input - start time must be before end time.');
      return;
    }

    // check if any date between start and end is not in available dates
    const availablePeriods = availableDates.map((period) => {
      return { start: new Date(period.start), end: new Date(period.end) };
    });
    for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
      if (!availablePeriods.some((period) => date >= period.start && date <= period.end)) {
        setErrorMessage('Error: Invalid input - start and end dates must be within available dates.');
        return;
      }
    }

    fetch('http://127.0.0.1:8000/reservations/reserve/', {
      method: 'POST',
      body: JSON.stringify(
        { start_day: startTime, 
          end_day: endTime, 
          property_id: id.id, 
          price: props.price,
          }
          ),
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` }
    })
      .then(response => {
        if (response.ok) {
          alert("request sent!");
          navigate('/reservation')
        } else {
          return response.json().then(data => {
            throw new Error(data.detail || 'Failed to make reservation. Please try again later.');
          });
        }
      })
      .catch(error => {
        console.error('Error sending reservation request:', error);
        setErrorMessage(error.message);
      });
  }
  if(!(availableDates.length > 0)){
    return (
      <div>
        No available times. 
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      {availableDates.length > 0 &&
        <Row className="mb-3">
          <Form.Group as={Row} controlId="ad">
            <Form.Label>Available Dates: </Form.Label>
            <Form.Select aria-label="Default select example">
              {availableDates.map((period, index) => (
                  <option key={index} value={`${period.start} - ${period.end}`}>{`${period.start} - ${period.end}`}</option>
                ))}
            </Form.Select>
          </Form.Group>
        </Row>
      }
      <Row className="mb-3">
        <Form.Group as={Col} controlId="start">
          <Form.Label>Start Date: </Form.Label>
          <Form.Control type="date" placeholder="YYYY-MM-DD" value={startTime} onChange={event => setStartTime(event.target.value)} required/>
        </Form.Group>

        <Form.Group as={Col} controlId="end">
          <Form.Label>End Date: </Form.Label>
          <Form.Control type="date" placeholder="YYYY-MM-DD" value={endTime} onChange={event => setEndTime(event.target.value)} required />
        </Form.Group>
      </Row>
      <Row>
      <Form.Group as={Col} controlId="start">
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      <Button variant='primary' onClick={handleSubmit}>Submit</Button>
      </Form.Group>
      </Row>
    </Form>
  );
}
export default ReserveForm;