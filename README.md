# TicketApp

TicketApp is a web application designed to simplify the process of ordering tickets and managing queues for events in local universities. The system allows users to browse upcoming events, join queues, receive notifications about their queue positions, and book seats with ease. NUTicket is designed to handle high user traffic and provides a smooth, efficient experience for event-goers.

## Features

- **Events Page**:
  - Displays a list of all upcoming events.
  - Users can join the queue for events they wish to attend.

- **Queues Page**:
  - Shows the active queues the user has joined.
  - Allows users to monitor their position in the queue and receive notifications about estimated wait times.

- **History Page**:
  - Displays a history of previously booked seats and pass tickets for events.
  - Enables users to view and manage their past bookings.

- **Notifications**:
  - Once a user joins a queue, the system notifies them about their queue time span.
  - Upon successfully booking a seat, the user receives another notification with ticket details and booking status.

## User Authentication

TicketApp uses Google OAuth for secure user authentication. Users are required to log in using their university email (...@nu.edu.kz for example). All notifications regarding queues, bookings, and event details are sent to the email address associated with the user's login.

## Technologies used
- **Backend**: Python, FastAPI, MongoDB
- **Frontend**: JavaScript, ReactJS, Bootstrap
- **Admin**: Python, Streamlit


## Demo

https://github.com/user-attachments/assets/213ef6e6-7238-4fb9-91b6-d4aeb27b72b6



