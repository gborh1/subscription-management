INSERT INTO users (username, password, first_name, last_name, email, has_paid)
VALUES ('testunpaid',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Unpaid',
        'joel@joelburton.com',
        FALSE),
       ('testpaid',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Paid!',
        'joel@joelburton.com',
        TRUE);

INSERT INTO admins (username, password, first_name, last_name, email)
VALUES  ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin!',
        'joel@joelburton.com');

INSERT INTO products (title, price, description)
VALUES  ('Listing & Post-Close', 375, 'This is where we handle all your listing and post-close tasks'), 
        ('Paid Ads', 225, 'This is where we handle all your paid advertising' ),
        ('Unpaid Ads', 375, 'This is where we do all your social media posts.  Everything is personalized and customized to your needs.'),
        ('Email Marketing', 275, 'Personalized email marketing to your sphere of influence. Customized to your liking and in your voice'),
        ('CRM', 100, 'Manage all your your clients in one place'),
        ('Follow-Up Cal', 100, 'Worry no more about how to follow up with your clients.  Give us your close date and we will tell you when to follow up!'), 
        ('Review Pal', 100, 'Let us help you get reviews. It is essential for your business. This tool will auto text to your clients to get review when you close!'),
        ('Your Site', 325, 'No more weak sauce sites! This site will help you get leads! Sign up and we will customize a perfect site for you')
