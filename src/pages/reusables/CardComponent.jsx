import React from 'react';

const CardComponent = ({ title, imageBase, image, value }) => {
  return (
    <>
        <div className="card-single px-4 py-3">
            <div className="d-flex justify-content-between">
                <div>
                    <p style={{color: "#707A8F"}}>{title}</p>
                </div>
                <div>
                    <img src={image} alt="" />
                </div>
            </div>
            <div className="card-body-item">
                <p style={{fontSize: "20px"}}>{value}</p>
            </div>
            <div className="card-base">
                <img src={imageBase} alt="" />
            </div>
        </div>
    </>
  )
}

export default CardComponent