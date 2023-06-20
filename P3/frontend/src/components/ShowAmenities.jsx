import React from 'react';

function AmenitiesTable({ amenities }) {
  const allAmenities = ['wifi', 'kitchen', 'washer', 'dryer', 'air_cond', 'heating', 'hair_dryer', 'TV', 'pool', 
  'hot_tub', 'bbq', 'gym'];

  // Convert the amenities string to an array of amenities
  const propertyAmenities = amenities.split(',');

  // Filter the list of all amenities to only include the amenities the property has
  const propertyAmenityDetails = allAmenities.filter((amenity) =>
    propertyAmenities.includes(amenity)
  );

  return (
    <table>
      <thead>
        <tr>
          <th>Amenity</th>
          <th>Available</th>
        </tr>
      </thead>
      <tbody>
        {propertyAmenityDetails.map((amenity) => (
          <tr key={amenity}>
            <td>{amenity}</td>
            <td>✓</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AmenitiesTable;