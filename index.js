require("dotenv").config({});

const express = require("express");
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const path = require("path");
const { DataTypes } = require('sequelize');
const cors = require("cors");

let sequelize;

if (process.env.NODE_ENV === "development") {
    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: "sample.db",
    });
} else {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        protocol: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    });
}

//Models
const VirtualShelf = sequelize.define('VirtualShelf', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 255]
        }
    },
    creationDate: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [5, 255]
        }
    },
    genre: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Action', 'Adventure', 'Comedy', 'Drama', 'Tragedy']
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true,
        },
    }
});

//relationships
VirtualShelf.hasMany(Book);

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(cors());

//routes
app.get("/create", async (req, res, next) => {
    try {
        await sequelize.sync({ force: true });
        res.status(201).json({ message: "Database created with the models!" });
    } catch (err) {
        next(err);
    }
});

//get all the shelves from the database
app.get("/virtualShelves", async (req, res, next) => {
    try {
        const pageAsNumber = Number.parseInt(req.query.page);
        const sizeAsNumber = Number.parseInt(req.query.size);
        const description = req.query.description;
        const creationDate = req.query.creationDate;

        let page = 0;
        if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
            page = pageAsNumber;
        }

        let size = 10;
        if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0 && sizeAsNumber < 10) {
            size = sizeAsNumber;
        }
        const virtualShelves = await VirtualShelf.findAll({
            where: description ? { description: { [Op.like]: `${description}%` } } : undefined ||
            creationDate ? { creationDate: { [Op.gt]: creationDate } } : undefined,

            order: [
                ['id', 'ASC']
            ],

            limit: size,
            offset: page * size,
        });
        res.status(200).json(virtualShelves);
    } catch (err) {
        next(err);
    }
});

//add data to the virtual shelves table
app.post("/virtualShelves", async (req, res, next) => {
    try {
        await VirtualShelf.create(req.body);
        res.status(201).json({ message: "virtual shelf created!" });
    } catch (err) {
        next(err);
    }
});

//get the data of a certain virtual shelf 
app.get("/virtualShelves/:shelfId", async (req, res, next) => {
    try {
        const virtualShelf = await VirtualShelf.findByPk(req.params.shelfId, {
            include: Book,
        });

        if (virtualShelf) {
            res.status(200).json(virtualShelf);
        } else {
            res.status(404).json({ message: "404 - Shelf not found" });
        }
    } catch (err) {
        next(err);
    }
});

//update the data of a certain virtual shelf
app.put("/virtualShelves/:shelfId", async (req, res, next) => {
    try {
        const virtualShelf = await VirtualShelf.findByPk(req.params.shelfId);

        if (virtualShelf) {
            await virtualShelf.update(req.body, {
                fields: ["id", "description", "creationDate"],
            });

            res.status(202).json({ message: "success" });
        } else {
            res.status(404).json({ message: "Shelf not found!" });
        }
    } catch (err) {
        next(err);
    }
});

//delete the data of a certain virtual shelf
app.delete("/virtualShelves/:shelfId", async (req, res, next) => {
    try {
        const virtualShelf = await VirtualShelf.findByPk(req.params.shelfId);

        if (virtualShelf) {
            await virtualShelf.destroy();

            res.status(201).json({ message: "Virtual shelf deleted!" });
        } else {
            res.status(404).json({ message: "Virtual shelf not found!" });
        }
    } catch (err) {
        next(err);
    }
});

//get all the books of a particular shelf
app.get("/virtualShelves/:shelfId/books", async (req, res, next) => {
    try {
        const virtualShelf = await VirtualShelf.findByPk(req.params.shelfId);

        if (virtualShelf) {
            const books = await virtualShelf.getBooks();

            res.status(200).json(books);
        } else {
            res.status(404).json({ message: "Shelf not found!" });
        }
    } catch (err) {
        next(err);
    }
});

//post books to a particular shelf 
app.post("/virtualShelves/:shelfId/books", async (req, res, next) => {
    try {
        const virtualShelf = await VirtualShelf.findByPk(req.params.shelfId);

        if (virtualShelf) {
            const book = new Book(req.body);
            book.virtualShelfId = virtualShelf.id;
            //await Book.create(book);
            await book.save();

            res.status(200).json({ message: "created"});
        } else {
            res.status(404).json({ message: "Shelf not found!" });
        }
    } catch (err) {
        next(err);
    }
});

//get a particular book of a particular shelf
app.get("/virtualShelves/:shelfId/books/:bid", async (req, res, next) => {
    try {
        const virtualShelf = await VirtualShelf.findByPk(req.params.shelfId);

        if (virtualShelf) {
            const books = await virtualShelf.getBooks({
                where: {
                    id: req.params.bid,
                },
            });
            const book = books.shift();

            if(book) {
                res.status(200).json(book);
            } else {
                res.status(404).json({ message: "Book not found!" });
            }
        } else {
            res.status(404).send({ message: "Shelf not found!" });
        }
    } catch (err) {
        next(err);
    }
});

//update the crewmember of a particular movie
app.put("/virtualShelves/:shelfId/books/:bid", async (req, res, next) => {
    try {
        const virtualShelf = await VirtualShelf.findByPk(req.params.shelfId);

        if (virtualShelf) {
            const books = await virtualShelf.getBooks({
                where: {
                    id: req.params.bid,
                }
            });
            const book = books.shift();

            if (book) {
                await book.update(req.body);
                res.status(200).json({ message: "success!" });
            } else {
                res.status(404).json({ message: "Book not found!" });
            }
        } else {
            res.status(404).json({ message: "Shelf not found!" });
        }
    } catch (err) {
        next(err);
    }
});

//delete a book of a particular shelf
app.delete("/virtualShelves/:shelfId/books/:bid", async (req, res, next) => {
    try {
        const virtualShelf = await VirtualShelf.findByPk(req.params.shelfId);

        if (virtualShelf) {
            const books = await virtualShelf.getBooks({
                where: {
                    id: req.params.bid,
                }
            });
            const book = books.shift();

            if (book) {
                await book.destroy();
                res.status(200).json({ message: "success!" });
            } else {
                res.status(404).json({ message: "Book not found!" });
            }
        } else {
            res.status(404).json({ message: "Shelf not found!" });
        }
    } catch (err) {
        next(err);
    }
});

// access the port from the .env file
app.listen(process.env.PORT, async () => {
    await sequelize.sync({ alter: true });
});