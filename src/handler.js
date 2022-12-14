const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);
  // Cek apakah buku telah selesai dibaca atau belum
  const finished = (pageCount === readPage);
  // Nilai finished didapatkan dari observasi pageCount === readPage

  const insertedAt = new Date().toISOString(); // menampung tanggal dimasukkannya buku
  const updatedAt = insertedAt; // menampung tanggal diperbarui buku

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  // Cek client tidak melampirkan properti name
  if (typeof name === 'undefined') {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }
  // Cek readPage lebih besar dari pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  books.push(newBook);// array push method

  // Cek sukses
  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }
  // else, error
  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const {
    name,
    reading,
    finished,
  } = request.query;

  // Cek client book berdasarkan name
  if (name) {
    const nameSearch = name.toLowerCase(); // variable penampung name

    const bookList = books // filter books
      .filter((book) => book.name.toLowerCase().includes(nameSearch))
      .map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));

    // return bookList dalam data
    const response = h.response(
      {
        status: 'success',
        data:
        {
          books: bookList,
        },
      },
    );
    response.code(200);
    return response;
  }

  // Cek client status reading
  if (reading) {
    const bookList = books // filter books
      .filter((book) => book.reading === (reading === '1'))
      .map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));

    // return bookList dalam data
    const response = h.response(
      {
        status: 'success',
        data:
          {
            books: bookList,
          },
      },
    );
    response.code(200);
    return response;
  }

  // Cek client status finished
  if (finished) {
    const bookList = books // filter books
      .filter((book) => book.finished === (finished === '1'))
      .map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));

    // return bookList dalam data
    const response = h.response(
      {
        status: 'success',
        data:
          {
            books: bookList,
          },
      },
    );
    response.code(200);
    return response;
  }

  // Response semua data client
  const response = h.response(
    {
      status: 'success',
      data:
      {
        books: books.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    },
  );
  response.code(200);
  return response;
};

const getBooksByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((boook) => boook.id === bookId)[0]; // tampung filter books

  // Cek book dengan id yang dilampirkan ditemukan
  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }

  // id yang dilampirkan oleh client tidak ditemukan
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const updatedAt = new Date().toISOString();
  // Nilai finished didapatkan dari observasi pageCount === readPage
  const finished = (pageCount === readPage);

  // Cek client tidak melampirkan properti name
  if (typeof name === 'undefined') {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // Cek readPage lebih besar dari pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt,
    };
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  // Id yang dilampirkan oleh client tidak ditemukkan
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);
  // Cek id dimiliki oleh salah satu buku, maka buku tersebut harus dihapus
  if (index !== -1) {
    books.splice(index, 1); // array splice method
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  // id yang dilampirkan tidak dimiliki oleh buku
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBooksByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
