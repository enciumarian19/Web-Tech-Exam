import React, { Fragment, useState, useEffect, useRef } from "react";
import axios from 'axios';
import { Link } from 'react-router-dom';

const ListShelf = () => {
    const [shelves, setShelves] = useState([]);

    useEffect(() => {
        const getShelves = async () => {
            const { data } = await axios.get('http://localhost:8080/virtualShelves');
            console.log(data)
            setShelves(data);
        }
        getShelves();
    }, []);

    const deleteShelf = async (id) => {
        await axios.delete(`http://localhost:8080/virtualShelves/${id}`);
        setShelves(shelves.filter(shelf => shelf.id !== id));
    }

    return (
        <Fragment>
            {""}
            <h1 className="text-center my-5">List of shelves</h1>
            <Link to='/add' className="btn btn-success">Add a shelf</Link>
            <table className="table mt-5">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Creation date</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        shelves.map(shelf => (
                            <tr key={shelf.id}>
                                <td>{shelf.description}</td>
                                <td>{shelf.creationDate}</td>
                                <td> <Link to='/edit' className="btn btn-warning">Edit </Link></td>
                                <td><button className="btn btn-danger" onClick={() => deleteShelf(shelf.id)}>Delete</button></td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <br></br>
        </Fragment>
    );
}

export default ListShelf;