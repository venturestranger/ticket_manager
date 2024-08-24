# API Documentation (Version 1)

This document describes the API endpoints of the NUTicket API.

---

## **Queue Endpoints** at `/api/rest/v1/`

### 1. `GET /queue`
Retrieve queues based on parameters.

- **Query Parameters**:
  - `id (str)`: (Optional) ID of the queue to retrieve.
  - `limit (int)`: (Optional) Number of queues to return.
  - `skip (int)`: (Optional) Number of queues to skip.
  - `all (bool)`: (Optional) Whether to retrieve all queues.

### 2. `POST /queue`
Create a new queue.

- **Body**:
  - `note (QueueV1)`: Object containing queue details (e.g., event ID, start/end time).

### 3. `PUT /queue`
Update an existing queue.

- **Query Parameters**:
  - `id (str)`: Queue ID.
  
- **Body**:
  - `note (QueueV1)`: Object containing updated queue details.

### 4. `DELETE /queue`
Delete a queue by its ID.

- **Query Parameters**:
  - `id (str)`: Queue ID.

---

## **Order Endpoints** at `/api/rest/v1/`

### 1. `GET /order`
Retrieve orders based on parameters.

- **Query Parameters**:
  - `id (str)`: (Optional) Order ID.
  - `limit (int)`: (Optional) Number of orders to return.
  - `skip (int)`: (Optional) Number of orders to skip.
  - `all (bool)`: (Optional) Whether to retrieve all orders.

### 2. `POST /order`
Create a new order.

- **Body**:
  - `note (OrderV1)`: Object containing order details (e.g., queue ID, seat number).

### 3. `PUT /order`
Update an existing order.

- **Query Parameters**:
  - `id (str)`: Order ID.
  
- **Body**:
  - `note (OrderV1)`: Object containing updated order details.

### 4. `DELETE /order`
Delete an order by its ID.

- **Query Parameters**:
  - `id (str)`: Order ID.

---

## **Event Endpoints** at `/api/rest/v1/`

### 1. `GET /event`
Retrieve events based on parameters.

- **Query Parameters**:
  - `id (str)`: (Optional) Event ID.
  - `limit (int)`: (Optional) Number of events to return.
  - `skip (int)`: (Optional) Number of events to skip.
  - `all (bool)`: (Optional) Whether to retrieve all events.

### 2. `POST /event`
Create a new event.

- **Body**:
  - `note (EventV1)`: Object containing event details (e.g., title, date, location).

### 3. `PUT /event`
Update an existing event.

- **Query Parameters**:
  - `id (str)`: Event ID.
  
- **Body**:
  - `note (EventV1)`: Object containing updated event details.

### 4. `DELETE /event`
Delete an event by its ID.

- **Query Parameters**:
  - `id (str)`: Event ID.

---

## **Host Endpoints** at `/api/rest/v1/`

### 1. `GET /host`
Retrieve hosts based on parameters.

- **Query Parameters**:
  - `id (str)`: (Optional) Host ID.
  - `limit (int)`: (Optional) Number of hosts to return.
  - `skip (int)`: (Optional) Number of hosts to skip.
  - `all (bool)`: (Optional) Whether to retrieve all hosts.

### 2. `POST /host`
Create a new host.

- **Body**:
  - `note (HostV1)`: Object containing host details (e.g., name, affiliation).

### 3. `PUT /host`
Update an existing host.

- **Query Parameters**:
  - `id (str)`: Host ID.
  
- **Body**:
  - `note (HostV1)`: Object containing updated host details.

### 4. `DELETE /host`
Delete a host by its ID.

- **Query Parameters**:
  - `id (str)`: Host ID.

---

## **Banner Endpoints** at `/api/rest/v1/`

### 1. `GET /banner`
Retrieve banners based on parameters.

- **Query Parameters**:
  - `id (str)`: (Optional) Banner ID.
  - `limit (int)`: (Optional) Number of banners to return.
  - `skip (int)`: (Optional) Number of banners to skip.

### 2. `POST /banner`
Upload a new banner.

- **Body**:
  - `file (UploadFile)`: Uploaded file (banner image).

### 3. `DELETE /banner`
Delete a banner by its ID.

- **Query Parameters**:
  - `id (str)`: Banner ID.

---

## **Security Endpoint** at `/api/rest/v1/`

### 1. `GET /auth`
Handle authentication based on provided key.

- **Query Parameters**:
  - `key (str)`: (Optional) API key for authentication.

---

## **Other Endpoints** at `/api/rest/v1/`

### 1. `POST /init_queue`
Initialize a queue.

- **Body**:
  - `request (InitQueueRequestV1)`: Queue initialization request object.
  
- **Response**:
  - Response object with initialization result.

### 2. `POST /book_place`
Book a place in the queue.

- **Body**:
  - `request (BookRequestV1)`: Booking request object.
  
- **Response**:
  - Response object with booking result.

### 3. `POST /init_sess`
Initialize a session.

- **Body**:
  - `request (InitSessionRequestV1)`: Session initialization request object.
  
- **Response**:
  - Response object with session details.

### 4. `GET /list_queues`
List all queues for a user.

- **Query Parameters**:
  - `user_id (str)`: User ID.

### 5. `GET /list_bookings`
List all bookings for a user.

- **Query Parameters**:
  - `user_id (str)`: User ID.

### 6. `GET /fetch_host`
Fetch host details by name.

- **Query Parameters**:
  - `name (str)`: Host name.

### 7. `GET /fetch_taken_seats`
Fetch taken seats for an event.

- **Query Parameters**:
  - `event_id (str)`: Event ID.

### 8. `POST /validate_payload`
Validate a payload.

- **Body**:
  - `hashed_payload (str)`: Hashed payload string.
  - `request (Request)`: HTTP request object.

### 9. `GET /remove_by_field`
Remove an entry from a collection based on a field value.

- **Query Parameters**:
  - `collection (str)`: Collection name.
  - `field (str)`: Field name.
  - `value (str)`: Value to match for deletion.

### 10. `GET /fetch_joined_events`
Fetch events that a user has joined.

- **Query Parameters**:
  - `user_id (str)`: User ID.

### 11. `GET /fetch_time` at `/api/etc/v1/`
Retrieve the current server time.

---

### Middleware

- **`auth_middleware_v1`**: Middleware ensuring JWT-based authentication for all incoming requests for `/api/rest/v1/` but not for `/api/etc/v1`.

---

### CORS

- CORS is enabled for all origins
