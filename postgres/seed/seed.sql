BEGIN TRANSACTION;
INSERT into users (name, email, entries, joined) values ('josh', 'josh123@gmail.com', 4, '2020-01-02');
INSERT into login (hash, email) values ('$2y$10$R8PHzpovLa4bdNEOUF1l1ONGyBeLE9ugBEUhbHeB1ST6RY2pgM6R.', 'josh123@gmail.com' );
 COMMIT;