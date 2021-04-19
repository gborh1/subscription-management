CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  has_paid BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT
);

CREATE TABLE admins (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  image_url TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  description TEXT NOT NULL,
  image_url TEXT
);

CREATE TABLE subscriptions (
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  product_id INTEGER
    REFERENCES products ON DELETE CASCADE,
  PRIMARY KEY (username, product_id)
);