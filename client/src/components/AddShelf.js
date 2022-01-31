import React, { Fragment, useState, useEffect } from "react";
import axios from 'axios';

const AddShelf = () => {
    const [description, setDescription] = useState('');
    const [creationDate, setCreationDate] = useState('');


    const addHandler = async (e) => {
        e.preventDefault();
        const data = {
            description: description,
            creationDate: creationDate
        }
        console.log(data);
        await axios.post('http://localhost:8080/virtualShelves', data);
        window.location = "/";
    }

    return (
        <Fragment>
            <h1 className="text-center my-5">Add a shelf</h1>
            <form>
                <p>Shelf Description</p>
                <input className="form-control" type="text" placeholder="description"
                value={description}
                onChange={e => setDescription(e.target.value)} />
                <br></br>
                <p>Creation date</p>
                <input className="form-control" type="date" value={creationDate} onChange={e => setCreationDate(e.target.value)} />
                <button className="btn btn-success mt-5 mb-5" onClick={addHandler}>Add Shelf</button>
            </form>
        </Fragment>
    );
}

export default AddShelf;