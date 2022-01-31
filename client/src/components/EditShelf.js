import React, { Fragment, useState, useEffect } from "react";

const EditShelf = (props) => {
    return (
        <Fragment>
            <h1 className="text-center my-5">Edit a shelf</h1>
            <form>
                <p>Change movie description</p>
                <input 
                    className="form-control" type="text" placeholder="shelf description"
                    defaultValue={props.title} 
                />
                <br></br>
                <p>Shelf Creation Date</p>
                <input className="form-control" type="date" defaultValue={props.releaseDate} />
                <button className="btn btn-success mt-5 mb-5">Save changes</button>
            </form>
        </Fragment>
    );
}

export default EditShelf;